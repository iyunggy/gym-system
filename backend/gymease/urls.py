from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    CustomerViewSet, MemberViewSet, ProdukViewSet,
    PromoViewSet, PersonalTrainerViewSet, JadwalPTViewSet,
    TransaksiViewSet, MembershipHistoryViewSet, PTSessionViewSet
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'members', MemberViewSet)
router.register(r'produk', ProdukViewSet)
router.register(r'promo', PromoViewSet)
router.register(r'personal-trainers', PersonalTrainerViewSet)
router.register(r'jadwal-pt', JadwalPTViewSet)
router.register(r'transaksi', TransaksiViewSet)
router.register(r'membership-history', MembershipHistoryViewSet)
router.register(r'pt-sessions', PTSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
]
