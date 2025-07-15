from django.contrib import admin
from .models import (
    Customer, Member, Produk, Promo, PersonalTrainer, 
    JadwalPT, Transaksi, MembershipHistory, PTSession
)

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'phone']
    list_filter = ['created_at']

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ['id_member', 'nama', 'tempat_lahir', 'is_active', 'created_at']
    search_fields = ['id_member', 'nama', 'alamat']
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['tanggal_lahir_lengkap', 'id_member']

@admin.register(Produk)
class ProdukAdmin(admin.ModelAdmin):
    list_display = ['nama_paket', 'harga', 'durasi_hari', 'is_active']
    list_filter = ['nama_paket', 'is_active']
    search_fields = ['deskripsi']

@admin.register(Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ['id_promo', 'nama_promo', 'diskon_persen', 'tanggal_mulai', 'tanggal_berakhir', 'is_active']
    list_filter = ['is_active', 'tanggal_mulai', 'tanggal_berakhir']
    search_fields = ['id_promo', 'nama_promo']
    readonly_fields = ['id_promo']

@admin.register(PersonalTrainer)
class PersonalTrainerAdmin(admin.ModelAdmin):
    list_display = ['id_pt', 'nama', 'sertifikasi', 'masa_kerja', 'is_active']
    search_fields = ['id_pt', 'nama', 'sertifikasi']
    list_filter = ['is_active']
    readonly_fields = ['id_pt']

@admin.register(JadwalPT)
class JadwalPTAdmin(admin.ModelAdmin):
    list_display = ['personal_trainer', 'hari', 'jam_mulai', 'jam_selesai', 'is_available']
    list_filter = ['hari', 'is_available']
    search_fields = ['personal_trainer__nama']

@admin.register(Transaksi)
class TransaksiAdmin(admin.ModelAdmin):
    list_display = ['id_transaksi', 'member', 'paket', 'total_bayar', 'status', 'tgl_transaksi']
    list_filter = ['status', 'tgl_transaksi', 'paket']
    search_fields = ['id_transaksi', 'member__nama']
    readonly_fields = ['id_transaksi', 'total_bayar']

@admin.register(MembershipHistory)
class MembershipHistoryAdmin(admin.ModelAdmin):
    list_display = ['member', 'tanggal_mulai', 'tanggal_berakhir', 'is_active']
    list_filter = ['is_active', 'tanggal_mulai', 'tanggal_berakhir']
    search_fields = ['member__nama']

@admin.register(PTSession)
class PTSessionAdmin(admin.ModelAdmin):
    list_display = ['member', 'personal_trainer', 'tanggal_session', 'status']
    list_filter = ['status', 'tanggal_session']
    search_fields = ['member__nama', 'personal_trainer__nama']
