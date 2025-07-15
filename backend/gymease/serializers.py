from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Customer, Member, Produk, Promo, PersonalTrainer,
    JadwalPT, Transaksi, MembershipHistory, PTSession
)
import uuid
import requests 
import json     

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = '__all__'

class MemberSerializer(serializers.ModelSerializer):
    # Field 'phone' untuk input (write_only)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)

    # Field 'display_phone' untuk output (read_only)
    display_phone = serializers.CharField(source='customer.phone', read_only=True)

    # Field 'customer' dari model Member. Tandai sebagai read_only.
    # Ini memberitahu DRF bahwa field ini tidak akan diterima sebagai input langsung.
    # Saat GET, ini akan menampilkan PK dari Customer yang terkait.
    customer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Member
        # Sertakan semua field yang relevan.
        # 'customer' akan ditangani oleh PrimaryKeyRelatedField di atas.
        fields = [
            'id_member', 'nama', 'alamat', 'tempat_lahir',
            'tanggal_lahir', 'bulan_lahir', 'tahun_lahir',
            'is_active', 'created_at', 'updated_at',
            'phone', 'display_phone', 'customer' # Sertakan 'customer' di fields
        ]
        read_only_fields = ['id_member', 'created_at', 'updated_at']

    def create(self, validated_data):
        phone_data = validated_data.pop('phone', '')

        # Buat User baru untuk Customer ini
        username = f"member_{uuid.uuid4().hex[:8]}"
        # Anda mungkin ingin menambahkan email ke User jika ada di form
        # Contoh: user_email = validated_data.get('email', f"{username}@example.com")
        user = User.objects.create_user(username=username, password="default_password")
        # Jika Anda ingin email di User model:
        # user.email = user_email
        # user.save()

        # Buat Customer baru yang terhubung ke User dan simpan nomor telepon
        customer = Customer.objects.create(user=user, phone=phone_data)

        # Buat Member baru, dan kaitkan dengan Customer yang baru dibuat
        member = Member.objects.create(customer=customer, **validated_data)

        # --- MULAI KIRIM NOTIFIKASI WHATSAPP ---
        try:
            # Pastikan nomor telepon diawali dengan '62'
            formatted_phone = member.customer.phone
            if not formatted_phone.startswith('62'):
                # Opsional: tambahkan '62' jika belum ada, atau log warning
                # formatted_phone = '62' + formatted_phone.lstrip('0')
                print(f"Warning: Phone number {formatted_phone} does not start with '62'. Skipping WhatsApp notification.")
                formatted_phone = None # Jangan kirim jika format tidak sesuai

            if formatted_phone:
                # Mengambil email dari User yang terhubung ke Customer
                member_email = member.customer.user.email if member.customer.user.email else "Tidak Tersedia"

                message_content = (
                    f"Selamat {member.nama} kamu sudah menjadi member gym ease dengan biodata sebagai berikut:\n\n"
                    f"Email: {member_email}\n"
                    f"Phone: {member.customer.phone}\n"
                    f"Alamat: {member.alamat}\n"
                    f"Tempat Lahir: {member.tempat_lahir}\n"
                    f"Tanggal Lahir: {member.tanggal_lahir_lengkap}\n\n"
                    f"Terima kasih sudah bergabung dengan GymEase!"
                )

                whatsapp_api_url = "https://payment-notif.maleotech.id/broadcastwhatsapp/personal"
                payload = {
                    "phone": formatted_phone,
                    "message": message_content,
                }
                headers = {"Content-Type": "application/json"}

                response = requests.post(whatsapp_api_url, data=json.dumps(payload), headers=headers)
                response.raise_for_status() # Akan memunculkan HTTPError untuk status kode 4xx/5xx

                print(f"WhatsApp success notification sent for member: {member.id_member}")
                print(f"WhatsApp API Response: {response.json()}")

        except requests.exceptions.RequestException as whatsapp_error:
            # Tangani error pengiriman WhatsApp, tapi jangan hentikan proses pembuatan member
            print(f"Failed to send WhatsApp success notification for member {member.id_member}: {whatsapp_error}")
            if hasattr(whatsapp_error, 'response') and whatsapp_error.response is not None:
                print(f"WhatsApp API Error Response: {whatsapp_error.response.text}")
        except Exception as e:
            print(f"An unexpected error occurred during WhatsApp notification for member {member.id_member}: {e}")
        # --- AKHIR KIRIM NOTIFIKASI PEMBAYARAN BERHASIL KE WHATSAPP ---

        return member
    def update(self, instance, validated_data):
        # Tangani pembaruan nomor telepon untuk Customer yang terkait
        phone_data = validated_data.pop('phone', None)

        # Perbarui field-field langsung pada instance Member
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Perbarui nomor telepon pada Customer yang terkait, jika ada dan phone_data diberikan
        if phone_data is not None and instance.customer:
            instance.customer.phone = phone_data
            instance.customer.save()

        return instance
class ProdukSerializer(serializers.ModelSerializer):
    nama_paket_display = serializers.CharField(source='get_nama_paket_display', read_only=True)
    
    class Meta:
        model = Produk
        fields = '__all__'

class PromoSerializer(serializers.ModelSerializer):
    paket_name = serializers.CharField(source='paket.get_nama_paket_display', read_only=True)
    
    class Meta:
        model = Promo
        fields = '__all__'
        read_only_fields = ['id_promo']

class PersonalTrainerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalTrainer
        fields = '__all__'
        read_only_fields = ['id_pt']

class JadwalPTSerializer(serializers.ModelSerializer):
    personal_trainer_name = serializers.CharField(source='personal_trainer.nama', read_only=True)
    hari_display = serializers.CharField(source='get_hari_display', read_only=True)
    
    class Meta:
        model = JadwalPT
        fields = '__all__'

class TransaksiSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.nama', read_only=True)
    paket_name = serializers.CharField(source='paket.get_nama_paket_display', read_only=True)
    promo_name = serializers.CharField(source='promo.nama_promo', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Transaksi
        fields = '__all__'
        read_only_fields = ['id_transaksi', 'total_bayar']

class MembershipHistorySerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.nama', read_only=True)
    transaksi_id = serializers.CharField(source='transaksi.id_transaksi', read_only=True)
    
    class Meta:
        model = MembershipHistory
        fields = '__all__'

class PTSessionSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source='member.nama', read_only=True)
    trainer_name = serializers.CharField(source='personal_trainer.nama', read_only=True)
    jadwal_info = serializers.CharField(source='jadwal.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = PTSession
        fields = '__all__'
