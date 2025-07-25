from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator # Corrected line
from decimal import Decimal
import uuid
import datetime

def generate_member_id():
    # Example: M-UUID_Short
    return f"M-{uuid.uuid4().hex[:8].upper()}"

def generate_pt_id():
    # Example: PT-UUID_Short
    return f"PT-{uuid.uuid4().hex[:8].upper()}"

class UserProfile(models.Model):
    created_at = models.DateTimeField(default=datetime.datetime.now)
    updated_at = models.DateTimeField(auto_now=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='profile')
    phone = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    kota = models.CharField(max_length=255, blank=True, null=True)
    kode_pos =  models.CharField(max_length=255, blank=True, null=True)
    tempat_lahir = models.CharField(max_length=255, blank=True, null=True)
    tanggal_lahir = models.DateField(blank=True, null=True)
    ROLES = (
        ('admin', 'admin'),
        ('member', 'member'),
        ('personal trainer', 'personal trainer'),
    )
    role = models.CharField(max_length=20, choices=ROLES, default='member')
    id_member = models.CharField(max_length=255, default=generate_member_id)
    id_pt = models.CharField(max_length=255, default=generate_pt_id)
    tahun_kerja = models.IntegerField(null=True, blank=True,
                                      validators=[MinValueValidator(0)])
    bulan_kerja = models.IntegerField(null=True, blank=True,
                                     validators=[MinValueValidator(0), MaxValueValidator(11)])
    sertifikasi_pt = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return str(self.user)

class JadwalPersonalTrainer(models.Model):
    created_at = models.DateTimeField(default=datetime.datetime.now)
    updated_at = models.DateTimeField(auto_now=True)
    HARI_CHOICES = [
        ('senin', 'senin'),
        ('selasa', 'selasa'),
        ('rabu', 'rabu'),
        ('kamis', 'kamis'),
        ('jumat', 'jumat'),
        ('sabtu', 'sabtu'),
        ('minggu', 'minggu'),
    ]

    pt = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    hari = models.CharField(max_length=10, choices=HARI_CHOICES, blank=True, null=True)
    tersedia_dari = models.TimeField(blank=True, null=True)
    tersedia_akhir = models.TimeField(blank=True, null=True)

    def __str__(self):
        return str(self.pt)
    
class Produk(models.Model):
    created_at = models.DateTimeField(default=datetime.datetime.now)
    updated_at = models.DateTimeField(auto_now=True)
    PAKET_CHOICES = [
        ('Stater Pack', 'Stater Pack'),
        ('Power Boost', 'Power Boost'),
        ('Ultimate Transform', 'Ultimate Transform'),
    ]
    nama_paket = models.CharField(max_length=20, choices=PAKET_CHOICES)
    deskripsi = models.TextField(blank=True, null=True)
    fitur_paket = models.JSONField(
        default=list, # Defaultnya adalah list kosong
        blank=True,
        null=True,
        help_text="Daftar fitur paket dalam format JSON array (e.g., [\"Fitur A\", \"Fitur B\"])"
    )
    harga = models.DecimalField(max_digits=10, decimal_places=2)
    durasi_hari = models.IntegerField(help_text="Durasi paket dalam hari")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nama_paket
    
class Promo(models.Model):
    created_at = models.DateTimeField(default=datetime.datetime.now)
    updated_at = models.DateTimeField(auto_now=True)
    id_promo = models.CharField(max_length=20, blank=True, null=True)
    nama_promo = models.CharField(max_length=100, blank=True, null=True)
    deskripsi = models.TextField(blank=True, null=True)
    diskon_persen = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    tanggal_mulai = models.DateField(blank=True, null=True)
    tanggal_berakhir = models.DateField(blank=True, null=True)
    produk = models.ForeignKey(Produk, on_delete=models.CASCADE, related_name='promos')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nama_promo} - {self.diskon_persen}%"

    def save(self, *args, **kwargs):
        if not self.id_promo:
            self.id_promo = f"PROMO{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)


class Transaksi(models.Model):
    created_at = models.DateTimeField(default=datetime.datetime.now)
    updated_at = models.DateTimeField(auto_now=True)
    STATUS_CHOICES = [
        ('unpaid', 'unpaid'),
        ('paid', 'paid'),
        ('expired', 'expired'),
    ]

    id_transaksi = models.CharField(max_length=20, blank=True, null=True)
    member = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name='trnsaksimember')
    produk = models.ForeignKey(Produk, on_delete=models.CASCADE, blank=True, null=True)
    promo = models.ForeignKey(Promo, on_delete=models.SET_NULL, null=True, blank=True)
    pt = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pt')
    jadwal_pt = models.ForeignKey(JadwalPersonalTrainer, on_delete=models.SET_NULL, blank=True, null=True)
    total_bayar = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unpaid')
    tanggal_mulai_membership = models.DateField(blank=True, null=True)
    tanggal_berakhir_membership = models.DateField(blank=True, null=True)
    xendit_qr_id = models.CharField(max_length=255, blank=True, null=True)
    xendit_qr_string = models.CharField(max_length=255, blank=True, null=True)
    # xendit_qr_code_url = models.CharField(max_length=255, blank=True, null=True)
    # xendit_expiry_date = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.id_transaksi

    def save(self, *args, **kwargs):
        if not self.id_transaksi:
            self.id_transaksi = f"TRX{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate total with discount
        total = self.produk.harga
        if self.promo:
            diskon = total * (self.promo.diskon_persen / 100)
            total = total - diskon
        self.total_bayar = total
        
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Transaksi"
        verbose_name_plural = "Transaksi"

# class MembershipHistory(models.Model):
#     member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='membership_history')
#     transaksi = models.OneToOneField(Transaksi, on_delete=models.CASCADE)
#     tanggal_mulai = models.DateField()
#     tanggal_berakhir = models.DateField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.member.nama} - {self.tanggal_mulai} to {self.tanggal_berakhir}"

#     class Meta:
#         verbose_name = "Membership History"
#         verbose_name_plural = "Membership History"

# class PTSession(models.Model):
#     STATUS_CHOICES = [
#         ('SCHEDULED', 'Scheduled'),
#         ('COMPLETED', 'Completed'),
#         ('CANCELLED', 'Cancelled'),
#         ('NO_SHOW', 'No Show'),
#     ]

#     member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='pt_sessions')
#     personal_trainer = models.ForeignKey(PersonalTrainer, on_delete=models.CASCADE, related_name='sessions')
#     jadwal = models.ForeignKey(JadwalPT, on_delete=models.CASCADE)
#     tanggal_session = models.DateField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
#     notes = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ['personal_trainer', 'jadwal', 'tanggal_session']
#         verbose_name = "PT Session"
#         verbose_name_plural = "PT Sessions"

#     def __str__(self):
#         return f"{self.member.nama} - {self.personal_trainer.nama} ({self.tanggal_session})"



# class Customer(models.Model):
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     user = models.OneToOneField(User, on_delete=models.CASCADE)
#     phone = models.CharField(max_length=15, blank=True)

#     def __str__(self):
#         return f"{self.user.first_name} {self.user.last_name}"

#     class Meta:
#         verbose_name = "Customer"
#         verbose_name_plural = "Customers"

# class Member(models.Model):
#     customer = models.OneToOneField(Customer, on_delete=models.CASCADE)
#     id_member = models.CharField(max_length=20, unique=True)
#     nama = models.CharField(max_length=100)
#     alamat = models.TextField()
#     tempat_lahir = models.CharField(max_length=50)
#     tanggal_lahir = models.IntegerField(validators=[MinValueValidator(1)])
#     bulan_lahir = models.IntegerField(validators=[MinValueValidator(1)])
#     tahun_lahir = models.IntegerField(validators=[MinValueValidator(1900)])
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.nama} ({self.id_member})"

#     @property
#     def tanggal_lahir_lengkap(self):
#         return f"{self.tempat_lahir}, {self.tanggal_lahir}/{self.bulan_lahir}/{self.tahun_lahir}"

#     def save(self, *args, **kwargs):
#         if not self.id_member:
#             self.id_member = f"MBR{uuid.uuid4().hex[:6].upper()}"
#         super().save(*args, **kwargs)

#     class Meta:
#         verbose_name = "Member"
#         verbose_name_plural = "Members"

# class Produk(models.Model):
#     PAKET_CHOICES = [
#         ('A', 'Paket A - Basic'),
#         ('B', 'Paket B - Standard'),
#         ('C', 'Paket C - Premium'),
#     ]
    
#     nama_paket = models.CharField(max_length=1, choices=PAKET_CHOICES)
#     deskripsi = models.TextField()
#     harga = models.DecimalField(max_digits=10, decimal_places=2)
#     durasi_hari = models.IntegerField(help_text="Durasi paket dalam hari")
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Paket {self.nama_paket} - {self.get_nama_paket_display()}"

#     class Meta:
#         verbose_name = "Produk"
#         verbose_name_plural = "Produk"

# class Promo(models.Model):
#     id_promo = models.CharField(max_length=20, unique=True)
#     nama_promo = models.CharField(max_length=100)
#     deskripsi = models.TextField()
#     diskon_persen = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
#     tanggal_mulai = models.DateField()
#     tanggal_berakhir = models.DateField()
#     paket = models.ForeignKey(Produk, on_delete=models.CASCADE, related_name='promos')
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.nama_promo} - {self.diskon_persen}%"

#     def save(self, *args, **kwargs):
#         if not self.id_promo:
#             self.id_promo = f"PROMO{uuid.uuid4().hex[:6].upper()}"
#         super().save(*args, **kwargs)

#     class Meta:
#         verbose_name = "Promo"
#         verbose_name_plural = "Promos"

# class PersonalTrainer(models.Model):
#     id_pt = models.CharField(max_length=20, unique=True)
#     nama = models.CharField(max_length=100)
#     sertifikasi = models.CharField(max_length=200)
#     masa_kerja = models.IntegerField(help_text="Masa kerja dalam bulan")
#     phone = models.CharField(max_length=15)
#     email = models.EmailField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"{self.nama} ({self.id_pt})"

#     def save(self, *args, **kwargs):
#         if not self.id_pt:
#             self.id_pt = f"PT{uuid.uuid4().hex[:6].upper()}"
#         super().save(*args, **kwargs)

#     class Meta:
#         verbose_name = "Personal Trainer"
#         verbose_name_plural = "Personal Trainers"

# class JadwalPT(models.Model):
#     HARI_CHOICES = [
#         ('SENIN', 'Senin'),
#         ('SELASA', 'Selasa'),
#         ('RABU', 'Rabu'),
#         ('KAMIS', 'Kamis'),
#         ('JUMAT', 'Jumat'),
#         ('SABTU', 'Sabtu'),
#         ('MINGGU', 'Minggu'),
#     ]

#     personal_trainer = models.ForeignKey(PersonalTrainer, on_delete=models.CASCADE, related_name='jadwal')
#     hari = models.CharField(max_length=10, choices=HARI_CHOICES)
#     jam_mulai = models.TimeField()
#     jam_selesai = models.TimeField()
#     is_available = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ['personal_trainer', 'hari', 'jam_mulai']
#         verbose_name = "Jadwal PT"
#         verbose_name_plural = "Jadwal PT"

#     def __str__(self):
#         return f"{self.personal_trainer.nama} - {self.hari} ({self.jam_mulai}-{self.jam_selesai})"

# class Transaksi(models.Model):
#     STATUS_CHOICES = [
#         ('PENDING', 'Pending'),
#         ('PAID', 'Paid'),
#         ('CANCELLED', 'Cancelled'),
#         ('EXPIRED', 'Expired'),
#     ]

#     id_transaksi = models.CharField(max_length=20, unique=True)
#     member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='transaksi')
#     paket = models.ForeignKey(Produk, on_delete=models.CASCADE)
#     promo = models.ForeignKey(Promo, on_delete=models.SET_NULL, null=True, blank=True)
#     personal_trainer = models.ForeignKey(PersonalTrainer, on_delete=models.SET_NULL, null=True, blank=True)
#     tgl_transaksi = models.DateTimeField(auto_now_add=True)
#     total_bayar = models.DecimalField(max_digits=10, decimal_places=2)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
#     tanggal_mulai_membership = models.DateField()
#     tanggal_berakhir_membership = models.DateField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return f"Transaksi {self.id_transaksi} - {self.member.nama}"

#     def save(self, *args, **kwargs):
#         if not self.id_transaksi:
#             self.id_transaksi = f"TRX{uuid.uuid4().hex[:8].upper()}"
        
#         # Calculate total with discount
#         total = self.paket.harga
#         if self.promo:
#             diskon = total * (self.promo.diskon_persen / 100)
#             total = total - diskon
#         self.total_bayar = total
        
#         super().save(*args, **kwargs)

#     class Meta:
#         verbose_name = "Transaksi"
#         verbose_name_plural = "Transaksi"

# class MembershipHistory(models.Model):
#     member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='membership_history')
#     transaksi = models.OneToOneField(Transaksi, on_delete=models.CASCADE)
#     tanggal_mulai = models.DateField()
#     tanggal_berakhir = models.DateField()
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.member.nama} - {self.tanggal_mulai} to {self.tanggal_berakhir}"

#     class Meta:
#         verbose_name = "Membership History"
#         verbose_name_plural = "Membership History"

# class PTSession(models.Model):
#     STATUS_CHOICES = [
#         ('SCHEDULED', 'Scheduled'),
#         ('COMPLETED', 'Completed'),
#         ('CANCELLED', 'Cancelled'),
#         ('NO_SHOW', 'No Show'),
#     ]

#     member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='pt_sessions')
#     personal_trainer = models.ForeignKey(PersonalTrainer, on_delete=models.CASCADE, related_name='sessions')
#     jadwal = models.ForeignKey(JadwalPT, on_delete=models.CASCADE)
#     tanggal_session = models.DateField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
#     notes = models.TextField(blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ['personal_trainer', 'jadwal', 'tanggal_session']
#         verbose_name = "PT Session"
#         verbose_name_plural = "PT Sessions"

#     def __str__(self):
#         return f"{self.member.nama} - {self.personal_trainer.nama} ({self.tanggal_session})"
