from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta, date
from django.db.models import Q, Count
from .models import (
    Customer, Member, Produk, Promo, PersonalTrainer,
    JadwalPT, Transaksi, MembershipHistory, PTSession
)
from .serializers import (
    CustomerSerializer, MemberSerializer, ProdukSerializer,
    PromoSerializer, PersonalTrainerSerializer, JadwalPTSerializer,
    TransaksiSerializer, MembershipHistorySerializer, PTSessionSerializer
)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    
    def get_queryset(self):
        queryset = Member.objects.all()
        search = self.request.query_params.get('search', None)
        status_filter = self.request.query_params.get('status', None)
        
        if search:
            queryset = queryset.filter(
                Q(nama__icontains=search) | 
                Q(id_member__icontains=search) |
                Q(alamat__icontains=search)
            )
        
        if status_filter:
            if status_filter == 'active':
                queryset = queryset.filter(is_active=True)
            elif status_filter == 'inactive':
                queryset = queryset.filter(is_active=False)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def membership_status(self, request, pk=None):
        member = self.get_object()
        active_membership = MembershipHistory.objects.filter(
            member=member,
            is_active=True,
            tanggal_berakhir__gte=timezone.now().date()
        ).first()
        
        if active_membership:
            return Response({
                'status': 'active',
                'membership': MembershipHistorySerializer(active_membership).data
            })
        else:
            return Response({'status': 'inactive'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_members = Member.objects.count()
        active_members = Member.objects.filter(is_active=True).count()
        inactive_members = total_members - active_members
        
        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'inactive_members': inactive_members
        })

class ProdukViewSet(viewsets.ModelViewSet):
    queryset = Produk.objects.filter(is_active=True)
    serializer_class = ProdukSerializer

class PromoViewSet(viewsets.ModelViewSet):
    queryset = Promo.objects.filter(is_active=True)
    serializer_class = PromoSerializer
    
    @action(detail=False, methods=['get'])
    def active_promos(self, request):
        today = timezone.now().date()
        active_promos = Promo.objects.filter(
            is_active=True,
            tanggal_mulai__lte=today,
            tanggal_berakhir__gte=today
        )
        serializer = self.get_serializer(active_promos, many=True)
        return Response(serializer.data)

class PersonalTrainerViewSet(viewsets.ModelViewSet):
    queryset = PersonalTrainer.objects.filter(is_active=True)
    serializer_class = PersonalTrainerSerializer

class JadwalPTViewSet(viewsets.ModelViewSet):
    queryset = JadwalPT.objects.filter(is_available=True)
    serializer_class = JadwalPTSerializer
    
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        trainer_id = request.query_params.get('trainer_id')
        date_param = request.query_params.get('date')
        
        if trainer_id and date_param:
            available_slots = JadwalPT.objects.filter(
                personal_trainer_id=trainer_id,
                is_available=True
            ).exclude(
                sessions__tanggal_session=date_param,
                sessions__status__in=['SCHEDULED', 'COMPLETED']
            )
            serializer = self.get_serializer(available_slots, many=True)
            return Response(serializer.data)
        
        return Response({'error': 'trainer_id and date parameters required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class TransaksiViewSet(viewsets.ModelViewSet):
    queryset = Transaksi.objects.all()
    serializer_class = TransaksiSerializer
    
    def get_queryset(self):
        queryset = Transaksi.objects.all()
        status_filter = self.request.query_params.get('status', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        transaksi = self.get_object()
        if transaksi.status == 'PENDING':
            transaksi.status = 'PAID'
            transaksi.save()
            
            # Create membership history
            MembershipHistory.objects.create(
                member=transaksi.member,
                transaksi=transaksi,
                tanggal_mulai=transaksi.tanggal_mulai_membership,
                tanggal_berakhir=transaksi.tanggal_berakhir_membership
            )
            
            return Response({'status': 'Payment confirmed'})
        
        return Response({'error': 'Transaction not in pending status'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        total_transactions = Transaksi.objects.count()
        paid_transactions = Transaksi.objects.filter(status='PAID').count()
        pending_transactions = Transaksi.objects.filter(status='PENDING').count()
        total_revenue = sum([t.total_bayar for t in Transaksi.objects.filter(status='PAID')])
        
        return Response({
            'total_transactions': total_transactions,
            'paid_transactions': paid_transactions,
            'pending_transactions': pending_transactions,
            'total_revenue': total_revenue
        })

class MembershipHistoryViewSet(viewsets.ModelViewSet):
    queryset = MembershipHistory.objects.all()
    serializer_class = MembershipHistorySerializer

class PTSessionViewSet(viewsets.ModelViewSet):
    queryset = PTSession.objects.all()
    serializer_class = PTSessionSerializer
    
    @action(detail=True, methods=['post'])
    def complete_session(self, request, pk=None):
        session = self.get_object()
        session.status = 'COMPLETED'
        session.notes = request.data.get('notes', '')
        session.save()
        
        return Response({'status': 'Session completed'})

    @action(detail=False, methods=['get'])
    def today_sessions(self, request):
        today = date.today()
        sessions = PTSession.objects.filter(tanggal_session=today)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
