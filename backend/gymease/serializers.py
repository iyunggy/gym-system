from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Customer, Member, Produk, Promo, PersonalTrainer,
    JadwalPT, Transaksi, MembershipHistory, PTSession
)

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
    tanggal_lahir_lengkap = serializers.ReadOnlyField()
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    
    class Meta:
        model = Member
        fields = '__all__'
        read_only_fields = ['id_member']

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
