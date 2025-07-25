from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count
from django.contrib.auth.models import User
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from . import models, serializers
from django.shortcuts import get_object_or_404 # Untuk mengambil objek jadwal PT
import json
import os
import requests
import base64
from datetime import datetime, timedelta, timezone

class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        # Ambil data UserProfile yang terkait
        # Pastikan model UserProfile memiliki OneToOneField ke User dengan related_name='profile'
        user_profile_data = {}
        try:
            # Menggunakan serializer kustom untuk UserLoginSerializer
            user_data = serializers.UserLoginSerializer(user).data
        except models.UserProfile.DoesNotExist:
            # Handle jika UserProfile belum ada (misal: user lama tanpa profile)
            user_data = serializers.UserLoginSerializer(user).data
            user_data['profile'] = None # Set profile ke None jika tidak ditemukan
        except Exception as e:
            user_data = serializers.UserLoginSerializer(user).data
            user_data['profile'] = None # Fallback jika ada error lain

        return Response({
            'token': token.key,
            'user': user_data # Menggunakan data user yang sudah diserialisasi termasuk profile
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.UserCreateSerializer
        return serializers.UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.AllowAny] # Siapapun bisa mendaftar
        elif self.action in ['retrieve', 'update', 'partial_update']:
            # User yang login bisa mengedit profilnya sendiri, atau admin bisa mengedit user lain
            # Untuk membatasi hanya pada diri sendiri, Anda akan butuh Custom Permission
            self.permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['list', 'destroy']:
            self.permission_classes = [permissions.IsAdminUser] # Hanya admin yang bisa melihat daftar atau menghapus
        else:
            self.permission_classes = [permissions.IsAdminUser] # Default untuk action lain
        return super().get_permissions()

class ProdukViewSet(viewsets.ModelViewSet):
    queryset = models.Produk.objects.all()
    serializer_class = serializers.ProdukSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class JadwalPersonalTrainerViewSet(viewsets.ModelViewSet):
    queryset = models.JadwalPersonalTrainer.objects.all()
    serializer_class = serializers.JadwalPersonalTrainerSerializer

    def get_permissions(self):
        if self.action == 'list':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
def create_xendit_qr_code(order_id, total_amount):
    try:
        # Menggunakan UTC untuk konsistensi waktu
        # expires_at = (datetime.now() + timedelta(minutes=30))

        data = {
            "reference_id": order_id,
            "type": "DYNAMIC",  # Bisa DYNAMIC atau STATIC
            "amount": float(total_amount),  # Nominal dalam IDR
            "currency": "IDR", 
            # "expires_at": expires_at.isoformat() + "Z",  # Format waktu UTC
        }

        XENDIT_SECRET_KEY = "xnd_production_r1FWbzOtsPsP0RW9bCW3tQPu5Auo8pUqTWL5lvwv90oMrvJDc0cBp0E601zHjz"  # Jangan hardcode di kode produksi!
        auth_header = base64.b64encode(f"{XENDIT_SECRET_KEY}:".encode()).decode()

        headers = {
            "api-version": "2022-07-31",
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_header}",
            "webhook-url": "https://educourse.id/api/exameducourse/xendit_callback/qr/" #pakai default webhook di xendit
        }


        response = requests.post("https://api.xendit.co/qr_codes", headers=headers, data=json.dumps(data))
        response.raise_for_status() # Akan memunculkan HTTPError untuk respons status 4xx/5xx

        qr_code_response = response.json()

        if (
            not qr_code_response or
            "qr_string" not in qr_code_response or
            "status" not in qr_code_response
        ):
            # print(
            #     "Xendit response missing critical fields (qr_string or status):",
            #     qr_code_response
            # )
            return None

        return qr_code_response

    except requests.exceptions.HTTPError as http_err:
        return None
    except requests.exceptions.RequestException as req_err:
        return None
    except Exception as e:
        return None

class TransaksiCreateAPIView(generics.CreateAPIView):
    queryset = models.Transaksi.objects.all()
    serializer_class = serializers.TransaksiSerializer
    permission_classes = [permissions.IsAuthenticated] # Hanya user yang terautentikasi bisa membuat transaksi

    def perform_create(self, serializer):
        # Sebelum menyimpan, pastikan produk dan PT yang dikirim valid
        produk_id = self.request.data.get('produk')
        pt_schedule_id = self.request.data.get('pt') # Ini adalah ID JadwalPT dari frontend

        produk = get_object_or_404(models.Produk, id=produk_id)
        
        # Cari jadwal PT berdasarkan ID yang dikirim
        jadwal_pt = get_object_or_404(models.JadwalPersonalTrainer, id=pt_schedule_id)

        # Perbarui data yang akan disimpan oleh serializer
        serializer.save(
            member=self.request.user, # Otomatis set member ke user yang sedang login
            produk=produk,
            jadwal_pt=jadwal_pt, # Set PT ke user PT yang ditemukan
            promo=None # Asumsi tidak ada promo dari frontend untuk saat ini
            # total_bayar, status, tanggal_mulai_membership, tanggal_berakhir_membership akan dihitung di model save()
        )

    # Anda bisa override create jika ingin kontrol lebih lanjut atas respons atau error
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Panggil perform_create untuk menyimpan transaksi ke database
        # Setelah ini, instance transaksi yang baru dibuat dapat diakses melalui serializer.instance
        self.perform_create(serializer) 
        
        transaksi_instance = serializer.instance # Dapatkan instance transaksi yang baru dibuat

        # --- Mulai integrasi Xendit ---
        order_id = transaksi_instance.id_transaksi
        total_amount = transaksi_instance.total_bayar

        if not order_id:
            # print("Error: Transaksi ID tidak dihasilkan. Tidak bisa membuat QR Xendit.")
            return Response(
                {'message': 'Transaksi berhasil dibuat, tetapi gagal memproses pembayaran.', 'error': 'Missing transaction ID'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        qr_code_xendit_data = create_xendit_qr_code(order_id, total_amount)

        # kirim notif ke whatsapp
        message_content = (
            f"Selamat Pembembelian paket {transaksi_instance.produk.nama_paket} berhasil dibuat dengan detail sebagai berikut:\n\n"
            f"ID Transaksi: {transaksi_instance.id_transaksi}\n"
            f"Link Pembayaran: https://gy-system-frontend-kqzk5.ondigitalocean.app/{transaksi_instance.id_transaksi}\n\n"
            f"Segera Lakukan Pembayaran!"
        )

        whatsapp_api_url = "https://payment-notif.maleotech.id/broadcastwhatsapp/personal"
        payload = {
            "phone": transaksi_instance.member.profile.phone,
            "message": message_content,
        }
        headers = {"Content-Type": "application/json"}

        response = requests.post(whatsapp_api_url, data=json.dumps(payload), headers=headers)
        response.raise_for_status() # Akan memunculkan HTTPError untuk status kode 4xx/5xx


        if qr_code_xendit_data:
            response_data = {
                'message': 'Transaksi dan QR Code pembayaran berhasil dibuat!',
                'id_transaksi': transaksi_instance.id_transaksi,
                'transaksi_data': serializer.data,
                'xendit_qr_code': {
                    'id': qr_code_xendit_data.get('id'),
                    'reference_id': qr_code_xendit_data.get('reference_id'),
                    'qr_string': qr_code_xendit_data.get('qr_string'),
                    'qr_url': qr_code_xendit_data.get('qr_url'),
                    'status': qr_code_xendit_data.get('status'),
                    'expires_at': qr_code_xendit_data.get('expires_at'),
                }
            }
            transaksi_instance.xendit_qr_id = qr_code_xendit_data.get('id')
            transaksi_instance.xendit_qr_string = qr_code_xendit_data.get('qr_string')
            transaksi_instance.save()
            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(
                {'message': 'Transaksi berhasil dibuat, tetapi gagal membuat QR Code pembayaran. Silakan coba lagi.',
                 'id_transaksi': transaksi_instance.id_transaksi,
                 'error': 'Xendit QR Code creation failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class TransaksiDetailAPIView(generics.RetrieveAPIView):
    queryset = models.Transaksi.objects.all()
    serializer_class = serializers.TransaksiSerializer # Gunakan serializer detail
    lookup_field = 'id_transaksi' # Menggunakan field id_transaksi untuk lookup
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        id_transaksi = self.kwargs['id_transaksi']
        user = self.request.user
        return models.Transaksi.objects.filter(id_transaksi=id_transaksi)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(profile__role='member')
    serializer_class = serializers.UserLoginSerializer

    def _send_whatsapp_notification(self, user_instance):
        """
        Helper method untuk mengirim notifikasi WhatsApp.
        """
        try:
            if hasattr(user_instance, 'profile') and user_instance.profile:
                profile = user_instance.profile

                formatted_phone = profile.phone
                if formatted_phone:
                    # Pastikan nomor telepon diawali dengan '62'
                    if not formatted_phone.startswith('62'):
                        # print(f"Warning: Phone number {formatted_phone} does not start with '62'. Attempting to add '62'.")
                        if formatted_phone.startswith('0'):
                            formatted_phone = '62' + formatted_phone[1:]
                        else:
                            formatted_phone = '62' + formatted_phone
                    
                    # Jika setelah formatting nomor masih belum valid atau kosong
                    if not formatted_phone or not formatted_phone.isdigit():
                        # print(f"Skipping WhatsApp notification for {user_instance.username}: Formatted phone number invalid: {formatted_phone}")
                        return


                if formatted_phone:
                    member_email = user_instance.email if user_instance.email else "Tidak Tersedia"
                    member_full_name = f"{user_instance.first_name} {user_instance.last_name}".strip()
                    member_address = profile.address if profile.address else "Tidak Tersedia"
                    member_birth_place = profile.tempat_lahir if profile.tempat_lahir else "Tidak Tersedia"

                    tanggal_lahir_formatted = "Tidak Tersedia"
                    if profile.tanggal_lahir:
                        try:
                            tanggal_lahir_formatted = profile.tanggal_lahir.strftime("%d %B %Y")
                        except ValueError: # Fallback jika locale tidak terpasang
                            tanggal_lahir_formatted = profile.tanggal_lahir.strftime("%d-%m-%Y")

                    message_content = (
                        f"Selamat {member_full_name} kamu sudah menjadi member gym ease dengan biodata sebagai berikut:\n\n"
                        f"Email: {member_email}\n"
                        f"Phone: {profile.phone}\n" # Gunakan nomor asli dari profil untuk display
                        f"Alamat: {member_address}\n"
                        f"Tempat Lahir: {member_birth_place}\n"
                        f"Tanggal Lahir: {tanggal_lahir_formatted}\n\n"
                        f"Terima kasih sudah bergabung dengan GymEase!"
                    )

                    whatsapp_api_url = "https://payment-notif.maleotech.id/broadcastwhatsapp/personal"
                    payload = {
                        "phone": formatted_phone,
                        "message": message_content,
                    }
                    headers = {"Content-Type": "application/json"}

                    response = requests.post(whatsapp_api_url, data=json.dumps(payload), headers=headers)
                    response.raise_for_status()

                    # print(f"WhatsApp success notification sent for member: {profile.id_member}")
                    # print(f"WhatsApp API Response: {response.json()}")
                # else:
                    # print(f"Skipping WhatsApp notification for {user_instance.username}: Phone number not available or invalid format.")
            # else:
                # print(f"Skipping WhatsApp notification for {user_instance.username}: UserProfile not found.")

        except requests.exceptions.RequestException as e:
            print(f"Error sending WhatsApp notification for member {user_instance.username}: {e}")
            if e.response:
                print(f"WhatsApp API Error Response: {e.response.text}")
        except Exception as e:
            print(f"An unexpected error occurred during WhatsApp notification for member {user_instance.username}: {e}")


    def perform_create(self, serializer):
        """
        Membuat instance User dan UserProfile, lalu mengirim notifikasi WhatsApp.
        Karena profile dan is_active read-only di serializer, kita tangani secara manual.
        """
        # Dapatkan data mentah dari request
        data = self.request.data

        # --- Bagian 1: Buat User ---
        # is_active tidak akan diproses oleh serializer.save() jika read_only=True
        # jadi kita perlu mengaturnya secara manual setelah user dibuat
        user_data_for_creation = {
            'username': data.get('email'), # Asumsi username sama dengan email dari frontend
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            # is_active akan diambil dari data request langsung karena read_only di serializer
            'is_active': data.get('is_active', True), # Default ke True jika tidak disediakan
        }
        
        # Buat user instance
        user_instance = User.objects.create(**user_data_for_creation)
        
        # Simpan password jika diperlukan (jika UserLoginSerializer juga menerima password)
        # Jika serializer menerima password, Anda mungkin perlu memprosesnya di sini
        # Contoh: user_instance.set_password(data.get('password'))
        # user_instance.save()

        # --- Bagian 2: Buat UserProfile ---
        profile_data = data.get('profile', {}) # Ambil data profile dari request

        # Tambahkan 'role' secara eksplisit sebagai 'member'
        profile_data['role'] = 'member' # Pastikan role selalu 'member' untuk viewset ini

        # Konversi tanggal_lahir dari string ke objek date jika ada
        tanggal_lahir_str = profile_data.get('tanggal_lahir')
        if tanggal_lahir_str:
            try:
                profile_data['tanggal_lahir'] =datetime.strptime(tanggal_lahir_str, "%Y-%m-%d").date()
            except ValueError:
                # print(f"Warning: Invalid date format for tanggal_lahir: {tanggal_lahir_str}")
                profile_data['tanggal_lahir'] = None # Atau tangani sesuai kebutuhan

        # Buat instance UserProfile dan kaitkan dengan user yang baru dibuat
        models.UserProfile.objects.create(user=user_instance, **profile_data)
        
        # Perlu me-refresh instance User untuk mendapatkan profil yang baru dibuat
        user_instance.refresh_from_db()


        # --- Bagian 3: Kirim Notifikasi WhatsApp ---
        self._send_whatsapp_notification(user_instance)

        # Untuk respons API, gunakan serializer untuk menserialisasi user_instance
        # Ini akan memastikan profil juga di-serialize untuk respons
        response_serializer = self.get_serializer(user_instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


# class MemberViewSet(viewsets.ModelViewSet):
#     queryset = Member.objects.all()
#     serializer_class = MemberSerializer
    
#     def get_queryset(self):
#         queryset = Member.objects.all()
#         search = self.request.query_params.get('search', None)
#         status_filter = self.request.query_params.get('status', None)
        
#         if search:
#             queryset = queryset.filter(
#                 Q(nama__icontains=search) | 
#                 Q(id_member__icontains=search) |
#                 Q(alamat__icontains=search)
#             )
        
#         if status_filter:
#             if status_filter == 'active':
#                 queryset = queryset.filter(is_active=True)
#             elif status_filter == 'inactive':
#                 queryset = queryset.filter(is_active=False)
        
#         return queryset
    
#     @action(detail=True, methods=['get'])
#     def membership_status(self, request, pk=None):
#         member = self.get_object()
#         active_membership = MembershipHistory.objects.filter(
#             member=member,
#             is_active=True,
#             tanggal_berakhir__gte=timezone.now().date()
#         ).first()
        
#         if active_membership:
#             return Response({
#                 'status': 'active',
#                 'membership': MembershipHistorySerializer(active_membership).data
#             })
#         else:
#             return Response({'status': 'inactive'})

#     @action(detail=False, methods=['get'])
#     def statistics(self, request):
#         total_members = Member.objects.count()
#         active_members = Member.objects.filter(is_active=True).count()
#         inactive_members = total_members - active_members
        
#         return Response({
#             'total_members': total_members,
#             'active_members': active_members,
#             'inactive_members': inactive_members
#         })

# class ProdukViewSet(viewsets.ModelViewSet):
#     queryset = Produk.objects.filter(is_active=True)
#     serializer_class = ProdukSerializer

# class PromoViewSet(viewsets.ModelViewSet):
#     queryset = Promo.objects.filter(is_active=True)
#     serializer_class = PromoSerializer
    
#     @action(detail=False, methods=['get'])
#     def active_promos(self, request):
#         today = timezone.now().date()
#         active_promos = Promo.objects.filter(
#             is_active=True,
#             tanggal_mulai__lte=today,
#             tanggal_berakhir__gte=today
#         )
#         serializer = self.get_serializer(active_promos, many=True)
#         return Response(serializer.data)

# class PersonalTrainerViewSet(viewsets.ModelViewSet):
#     queryset = PersonalTrainer.objects.filter(is_active=True)
#     serializer_class = PersonalTrainerSerializer

# class JadwalPTViewSet(viewsets.ModelViewSet):
#     queryset = JadwalPT.objects.filter(is_available=True)
#     serializer_class = JadwalPTSerializer
    
#     @action(detail=False, methods=['get'])
#     def available_slots(self, request):
#         trainer_id = request.query_params.get('trainer_id')
#         date_param = request.query_params.get('date')
        
#         if trainer_id and date_param:
#             available_slots = JadwalPT.objects.filter(
#                 personal_trainer_id=trainer_id,
#                 is_available=True
#             ).exclude(
#                 sessions__tanggal_session=date_param,
#                 sessions__status__in=['SCHEDULED', 'COMPLETED']
#             )
#             serializer = self.get_serializer(available_slots, many=True)
#             return Response(serializer.data)
        
#         return Response({'error': 'trainer_id and date parameters required'}, 
#                        status=status.HTTP_400_BAD_REQUEST)

# class TransaksiViewSet(viewsets.ModelViewSet):
#     queryset = Transaksi.objects.all()
#     serializer_class = TransaksiSerializer
    
#     def get_queryset(self):
#         queryset = Transaksi.objects.all()
#         status_filter = self.request.query_params.get('status', None)
        
#         if status_filter:
#             queryset = queryset.filter(status=status_filter.upper())
        
#         return queryset.order_by('-created_at')
    
#     @action(detail=True, methods=['post'])
#     def confirm_payment(self, request, pk=None):
#         transaksi = self.get_object()
#         if transaksi.status == 'PENDING':
#             transaksi.status = 'PAID'
#             transaksi.save()
            
#             # Create membership history
#             MembershipHistory.objects.create(
#                 member=transaksi.member,
#                 transaksi=transaksi,
#                 tanggal_mulai=transaksi.tanggal_mulai_membership,
#                 tanggal_berakhir=transaksi.tanggal_berakhir_membership
#             )
            
#             return Response({'status': 'Payment confirmed'})
        
#         return Response({'error': 'Transaction not in pending status'}, 
#                        status=status.HTTP_400_BAD_REQUEST)

#     @action(detail=False, methods=['get'])
#     def statistics(self, request):
#         total_transactions = Transaksi.objects.count()
#         paid_transactions = Transaksi.objects.filter(status='PAID').count()
#         pending_transactions = Transaksi.objects.filter(status='PENDING').count()
#         total_revenue = sum([t.total_bayar for t in Transaksi.objects.filter(status='PAID')])
        
#         return Response({
#             'total_transactions': total_transactions,
#             'paid_transactions': paid_transactions,
#             'pending_transactions': pending_transactions,
#             'total_revenue': total_revenue
#         })

# class MembershipHistoryViewSet(viewsets.ModelViewSet):
#     queryset = MembershipHistory.objects.all()
#     serializer_class = MembershipHistorySerializer

# class PTSessionViewSet(viewsets.ModelViewSet):
#     queryset = PTSession.objects.all()
#     serializer_class = PTSessionSerializer
    
#     @action(detail=True, methods=['post'])
#     def complete_session(self, request, pk=None):
#         session = self.get_object()
#         session.status = 'COMPLETED'
#         session.notes = request.data.get('notes', '')
#         session.save()
        
#         return Response({'status': 'Session completed'})

#     @action(detail=False, methods=['get'])
#     def today_sessions(self, request):
#         today = date.today()
#         sessions = PTSession.objects.filter(tanggal_session=today)
#         serializer = self.get_serializer(sessions, many=True)
#         return Response(serializer.data)
