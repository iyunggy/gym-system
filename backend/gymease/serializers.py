from rest_framework import serializers
from django.contrib.auth.models import User
from . import models
import uuid
import requests 
import json     

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer untuk membaca (list/retrieve) data User.
    Password tidak disertakan.
    """
    class Meta:
        model = User
        # Pilih field yang ingin diekspos saat membaca data user
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'last_login']
        read_only_fields = ['is_staff', 'date_joined', 'last_login'] # Field ini hanya bisa dibaca

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.UserProfile
        fields = '__all__'


class UserLoginSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True) # Nested serializer untuk UserProfile

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'profile', 'is_active'
        ]
        read_only_fields = ['is_active']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    phone = serializers.CharField(required=True, max_length=100, write_only=True)
    tempat_lahir = serializers.CharField(required=True, max_length=100, write_only=True)
    tanggal_lahir = serializers.CharField(required=True,max_length=100,  write_only=True)
    address = serializers.CharField(required=True, max_length=255, write_only=True)
    kota = serializers.CharField(required=True, max_length=100, write_only=True)
    kode_pos = serializers.CharField(required=True, max_length=100, write_only=True)
    role = serializers.CharField(required=True, max_length=100, write_only=True)

    class Meta:
        model = User
        # fields = ['username', 'email', 'first_name', 'last_name', 'password']
        fields = [
            'username', 'email', 'first_name', 'last_name', 'password', 'role',
            'phone', 'address', 'kota', 'tempat_lahir', 'tanggal_lahir', 'kode_pos'
        ]

        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        profile_data = {
            'phone': validated_data.pop('phone'),
            'address': validated_data.pop('address'),
            'kota': validated_data.pop('kota'),
            'kode_pos': validated_data.pop('kode_pos'),
            'tempat_lahir': validated_data.pop('tempat_lahir'),
            'tanggal_lahir': validated_data.get('tanggal_lahir', ''),
            'role': validated_data.pop('role'),
        }

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )

        profile = models.UserProfile.objects.create(user=user, **profile_data)

        # kirim notifikasi
        if profile.role == 'member':
            message_content = (
                f"Selamat {profile.user.username} pendaftara akun berhasil dengan biodata sebagai berikut:\n\n"
                f"Email: {profile.user.email}\n"
                f"Alamat: {profile.address}\n"
                f"Tempat Lahir: {profile.tempat_lahir}\n"
                f"Tanggal Lahir: {profile.tanggal_lahir}\n"
                f"ID Member: {profile.id_member}\n\n"
                f"Terima kasih sudah bergabung dengan GymEase!"
            )

            whatsapp_api_url = "https://payment-notif.maleotech.id/broadcastwhatsapp/personal"
            payload = {
                "phone": profile.phone,
                "message": message_content,
            }
            headers = {"Content-Type": "application/json"}

            response = requests.post(whatsapp_api_url, data=json.dumps(payload), headers=headers)
            response.raise_for_status() # Akan memunculkan HTTPError untuk status kode 4xx/5xx

        return user
    def update(self, instance, validated_data):
        # Override update untuk menangani perubahan password jika ada
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password) # Hash password baru
        return super().update(instance, validated_data)

class ProdukSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Produk
        fields = '__all__'

class JadwalPersonalTrainerSerializer(serializers.ModelSerializer):
    pt_detail = UserSerializer(source='pt', read_only=True)
    
    class Meta:
        model = models.JadwalPersonalTrainer
        fields = '__all__'


class TransaksiSerializer(serializers.ModelSerializer):
    # Memberikan representasi read-only untuk field terkait (jika diperlukan)
    # Ini membantu saat melihat data transaksi yang sudah ada
    member_detail = UserLoginSerializer(source='member', read_only=True)
    pt_detail = UserLoginSerializer(source='pt', read_only=True)
    # produk_detail = serializers.SerializerMethodField(read_only=True)
    # pt_detail = serializers.user(read_only=True)
    # promo_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = models.Transaksi
        fields = '__all__'
        # fields = [
        #     'id', # Django REST Framework biasanya menggunakan 'id' sebagai primary key default
        #     'id_transaksi',
        #     'member',
        #     'member_detail', # Untuk read-only representation
        #     'produk',
        #     'produk_detail', # Untuk read-only representation
        #     'promo',
        #     'promo_detail', # Untuk read-only representation
        #     'pt',
        #     'pt_detail', # Untuk read-only representation
        #     'total_bayar',
        #     'status',
        #     'tanggal_mulai_membership',
        #     'tanggal_berakhir_membership',
        #     'created_at',
        #     'updated_at'
        # ]
        read_only_fields = ['id_transaksi', 'total_bayar', 'status', 'tanggal_mulai_membership', 'tanggal_berakhir_membership', 'created_at', 'updated_at']

    def get_member_detail(self, obj):
        if obj.member:
            return {'id': obj.member.id, 'first_name': obj.member.first_name, 'last_name': obj.member.last_name, 'email': obj.member.email}
        return None

    def get_produk_detail(self, obj):
        if obj.produk:
            return {'id': obj.produk.id, 'nama_paket': obj.produk.nama_paket, 'harga': obj.produk.harga}
        return None

    def get_pt_detail(self, obj):
        if obj.pt:
            return {'id': obj.pt.id, 'first_name': obj.pt.first_name, 'last_name': obj.pt.last_name}
        return None

    def get_promo_detail(self, obj):
        if obj.promo:
            return {'id': obj.promo.id, 'nama_promo': obj.promo.nama_promo, 'diskon_persen': obj.promo.diskon_persen}
        return None

    def create(self, validated_data):
        # Mengambil user dari request jika menggunakan token authentication
        request = self.context.get('request', None)
        if request and hasattr(request, 'user'):
            validated_data['member'] = request.user
        else:
            # Handle case where user is not authenticated or not passed via context
            # Or if you're explicitly passing member ID from frontend (not recommended for security)
            pass # Or raise an error

        # Logika `save` di model Transaksi sudah menghitung total_bayar,
        # tanggal_mulai_membership, dan tanggal_berakhir_membership.
        # Jadi, kita hanya perlu memanggil super().create()
        transaksi = super().create(validated_data)
        return transaksi

class TransaksiSerializer(serializers.ModelSerializer):
    product_detail = ProdukSerializer(source='produk', read_only=True)
    member_detail = UserLoginSerializer(source='member', read_only=True)
    pt_detail = UserLoginSerializer(source='pt', read_only=True)
    
    class Meta:
        model = models.Transaksi
        fields = '__all__'

class PromoSerializer(serializers.ModelSerializer):
    product_detail = ProdukSerializer(source='produk', read_only=True)
    
    class Meta:
        model = models.Promo
        fields = '__all__'

# class MemberSerializer(serializers.ModelSerializer):
#     # Field 'phone' untuk input (write_only)
#     phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

#     # Field 'display_phone' untuk output (read_only)
#     display_phone = serializers.CharField(source='customer.phone', read_only=True)

#     # Field 'customer' dari model Member. Tandai sebagai read_only.
#     # Ini memberitahu DRF bahwa field ini tidak akan diterima sebagai input langsung.
#     # Saat GET, ini akan menampilkan PK dari Customer yang terkait.
#     customer = serializers.PrimaryKeyRelatedField(read_only=True)

#     class Meta:
#         model = Member
#         # Sertakan semua field yang relevan.
#         # 'customer' akan ditangani oleh PrimaryKeyRelatedField di atas.
#         fields = [
#             'id_member', 'nama', 'alamat', 'tempat_lahir',
#             'tanggal_lahir', 'bulan_lahir', 'tahun_lahir',
#             'is_active', 'created_at', 'updated_at',
#             'phone', 'display_phone', 'customer' # Sertakan 'customer' di fields
#         ]
#         read_only_fields = ['id_member', 'created_at', 'updated_at']

#     def create(self, validated_data):
#         phone_data = validated_data.pop('phone', '')

#         # Buat User baru untuk Customer ini
#         username = f"member_{uuid.uuid4().hex[:8]}"
#         # Anda mungkin ingin menambahkan email ke User jika ada di form
#         # Contoh: user_email = validated_data.get('email', f"{username}@example.com")
#         user = User.objects.create_user(username=username, password="default_password")
#         # Jika Anda ingin email di User model:
#         # user.email = user_email
#         # user.save()

#         # Buat Customer baru yang terhubung ke User dan simpan nomor telepon
#         customer = Customer.objects.create(user=user, phone=phone_data)

#         # Buat Member baru, dan kaitkan dengan Customer yang baru dibuat
#         member = Member.objects.create(customer=customer, **validated_data)

#         # --- MULAI KIRIM NOTIFIKASI WHATSAPP ---
#         try:
#             # Pastikan nomor telepon diawali dengan '62'
#             formatted_phone = member.customer.phone
#             if not formatted_phone.startswith('62'):
#                 # Opsional: tambahkan '62' jika belum ada, atau log warning
#                 # formatted_phone = '62' + formatted_phone.lstrip('0')
#                 print(f"Warning: Phone number {formatted_phone} does not start with '62'. Skipping WhatsApp notification.")
#                 formatted_phone = None # Jangan kirim jika format tidak sesuai

#             if formatted_phone:
#                 # Mengambil email dari User yang terhubung ke Customer
#                 member_email = member.customer.user.email if member.customer.user.email else "Tidak Tersedia"

#                 message_content = (
#                     f"Selamat {member.nama} kamu sudah menjadi member gym ease dengan biodata sebagai berikut:\n\n"
#                     f"Email: {member_email}\n"
#                     f"Phone: {member.customer.phone}\n"
#                     f"Alamat: {member.alamat}\n"
#                     f"Tempat Lahir: {member.tempat_lahir}\n"
#                     f"Tanggal Lahir: {member.tanggal_lahir_lengkap}\n\n"
#                     f"Terima kasih sudah bergabung dengan GymEase!"
#                 )

#                 whatsapp_api_url = "https://payment-notif.maleotech.id/broadcastwhatsapp/personal"
#                 payload = {
#                     "phone": formatted_phone,
#                     "message": message_content,
#                 }
#                 headers = {"Content-Type": "application/json"}

#                 response = requests.post(whatsapp_api_url, data=json.dumps(payload), headers=headers)
#                 response.raise_for_status() # Akan memunculkan HTTPError untuk status kode 4xx/5xx

#                 print(f"WhatsApp success notification sent for member: {member.id_member}")
#                 print(f"WhatsApp API Response: {response.json()}")

#         except requests.exceptions.RequestException as whatsapp_error:
#             # Tangani error pengiriman WhatsApp, tapi jangan hentikan proses pembuatan member
#             print(f"Failed to send WhatsApp success notification for member {member.id_member}: {whatsapp_error}")
#             if hasattr(whatsapp_error, 'response') and whatsapp_error.response is not None:
#                 print(f"WhatsApp API Error Response: {whatsapp_error.response.text}")
#         except Exception as e:
#             print(f"An unexpected error occurred during WhatsApp notification for member {member.id_member}: {e}")
#         # --- AKHIR KIRIM NOTIFIKASI PEMBAYARAN BERHASIL KE WHATSAPP ---

#         return member
#     def update(self, instance, validated_data):
#         # Tangani pembaruan nomor telepon untuk Customer yang terkait
#         phone_data = validated_data.pop('phone', None)

#         # Perbarui field-field langsung pada instance Member
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         # Perbarui nomor telepon pada Customer yang terkait, jika ada dan phone_data diberikan
#         if phone_data is not None and instance.customer:
#             instance.customer.phone = phone_data
#             instance.customer.save()

#         return instance
# class ProdukSerializer(serializers.ModelSerializer):
#     nama_paket_display = serializers.CharField(source='get_nama_paket_display', read_only=True)
    
#     class Meta:
#         model = Produk
#         fields = '__all__'

# class PromoSerializer(serializers.ModelSerializer):
#     paket_name = serializers.CharField(source='paket.get_nama_paket_display', read_only=True)
    
#     class Meta:
#         model = Promo
#         fields = '__all__'
#         read_only_fields = ['id_promo']

# class PersonalTrainerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PersonalTrainer
#         fields = '__all__'
#         read_only_fields = ['id_pt']

# class JadwalPTSerializer(serializers.ModelSerializer):
#     personal_trainer_name = serializers.CharField(source='personal_trainer.nama', read_only=True)
#     hari_display = serializers.CharField(source='get_hari_display', read_only=True)
    
#     class Meta:
#         model = JadwalPT
#         fields = '__all__'

# class TransaksiSerializer(serializers.ModelSerializer):
#     member_name = serializers.CharField(source='member.nama', read_only=True)
#     paket_name = serializers.CharField(source='paket.get_nama_paket_display', read_only=True)
#     promo_name = serializers.CharField(source='promo.nama_promo', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     class Meta:
#         model = Transaksi
#         fields = '__all__'
#         read_only_fields = ['id_transaksi', 'total_bayar']

# class MembershipHistorySerializer(serializers.ModelSerializer):
#     member_name = serializers.CharField(source='member.nama', read_only=True)
#     transaksi_id = serializers.CharField(source='transaksi.id_transaksi', read_only=True)
    
#     class Meta:
#         model = MembershipHistory
#         fields = '__all__'

# class PTSessionSerializer(serializers.ModelSerializer):
#     member_name = serializers.CharField(source='member.nama', read_only=True)
#     trainer_name = serializers.CharField(source='personal_trainer.nama', read_only=True)
#     jadwal_info = serializers.CharField(source='jadwal.__str__', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
    
#     class Meta:
#         model = PTSession
#         fields = '__all__'
