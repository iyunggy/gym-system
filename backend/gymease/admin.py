from django.contrib import admin
from . import models

@admin.register(models.UserProfile)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user', 'role', 'email', 'phone', ]
    search_fields = ['user__first_name', 'user__last_name', 'role', 'phone']
    ordering = ['created_at']

@admin.register(models.JadwalPersonalTrainer)
class JadwalPersonalTrainerAdmin(admin.ModelAdmin):
    list_display = ['pt', 'hari', 'tersedia_dari', 'tersedia_akhir']
    search_fields = ['pt__first_name', 'pt__last_name', 'hari', 'tersedia_dari', 'tersedia_akhir']
    ordering = ['pt', 'hari', 'tersedia_dari', 'tersedia_akhir']

@admin.register(models.Produk)
class ProdukAdmin(admin.ModelAdmin):
    list_display = ['nama_paket', 'harga', 'durasi_hari', 'is_active']
    search_fields = ['nama_paket', 'harga', 'durasi_hari']
    ordering = ['is_active', 'nama_paket']

@admin.register(models.Promo)
class PromoAdmin(admin.ModelAdmin):
    list_display = ['id_promo', 'nama_promo', 'diskon_persen', 'tanggal_mulai', 'tanggal_berakhir', 'produk', 'is_active']

# @admin.register(PersonalTrainer)
# class PersonalTrainerAdmin(admin.ModelAdmin):
#     list_display = ['id_pt', 'nama', 'sertifikasi', 'masa_kerja', 'is_active']
#     search_fields = ['id_pt', 'nama', 'sertifikasi']
#     list_filter = ['is_active']
#     readonly_fields = ['id_pt']

# @admin.register(JadwalPT)
# class JadwalPTAdmin(admin.ModelAdmin):
#     list_display = ['personal_trainer', 'hari', 'jam_mulai', 'jam_selesai', 'is_available']
#     list_filter = ['hari', 'is_available']
#     search_fields = ['personal_trainer__nama']

@admin.register(models.Transaksi)
class TransaksiAdmin(admin.ModelAdmin):
    list_display = ['id_transaksi', ]

# @admin.register(MembershipHistory)
# class MembershipHistoryAdmin(admin.ModelAdmin):
#     list_display = ['member', 'tanggal_mulai', 'tanggal_berakhir', 'is_active']
#     list_filter = ['is_active', 'tanggal_mulai', 'tanggal_berakhir']
#     search_fields = ['member__nama']

# @admin.register(PTSession)
# class PTSessionAdmin(admin.ModelAdmin):
#     list_display = ['member', 'personal_trainer', 'tanggal_session', 'status']
#     list_filter = ['status', 'tanggal_session']
#     search_fields = ['member__nama', 'personal_trainer__nama']
