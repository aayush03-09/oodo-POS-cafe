from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import SignupSerializer, UserSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_kitchen_pin(request):
    if request.user.role != 'admin':
        return Response({'error': 'Only admins can reset the Kitchen PIN'}, status=status.HTTP_403_FORBIDDEN)
    
    import random
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    new_pin = f"{random.randint(1000, 9999)}"
    kitchen_user, created = User.objects.get_or_create(username='kitchen', defaults={'role': 'kitchen'})
    kitchen_user.set_password(new_pin)
    kitchen_user.first_name = new_pin  # Store pin to retrieve later
    kitchen_user.save()
    
    return Response({'pin': new_pin, 'message': 'Kitchen PIN regenerated successfully.'})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_kitchen_pin(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        kitchen_user = User.objects.get(username='kitchen')
        return Response({'pin': kitchen_user.first_name})
    except User.DoesNotExist:
        return Response({'pin': None})
