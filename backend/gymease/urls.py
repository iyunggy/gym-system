from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from . import views

router = DefaultRouter()
router.register(r'user', views.UserViewSet)
router.register(r'members', views.MemberViewSet)
router.register(r'produk', views.ProdukViewSet)
router.register(r'promo', views.PromoViewSet)
router.register(r'personal-trainers', views.PersonalTrainerViewSet)
router.register(r'jadwal-pt', views.JadwalPersonalTrainerViewSet)
router.register(r'transaksis', views.TransaksisViewSet)
# router.register(r'membership-history', MembershipHistoryViewSet)
router.register(r'pt-sessions', views.PTSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/', views.CustomAuthToken.as_view()),
    path('transaksi/', views.TransaksiCreateAPIView.as_view(), name='create-transaksi'),
    path('transaksi-detail/<str:id_transaksi>/', views.TransaksiDetailAPIView.as_view(), name='transaksi-detail'),
    # path('auth/token/', obtain_auth_token, name='api_token_auth'),
    # path('register-account-member/', views.UserViewSet),
]
