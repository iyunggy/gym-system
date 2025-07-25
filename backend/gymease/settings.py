import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'your-secret-key-here'

DEBUG = False
# DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'ibupenggeraksidina.id', 'www.ibupenggeraksidina.id'] # Tambahkan domain produksi Anda di sini

# Tambahkan atau modifikasi bagian ini untuk CSRF_TRUSTED_ORIGINS
# Pastikan untuk menyertakan skema (http:// atau https://)
# dan port jika ada (misalnya, "http://localhost:3000" untuk pengembangan frontend)
CSRF_TRUSTED_ORIGINS = [
    "https://ibupenggeraksidina.id",
    "https://www.ibupenggeraksidina.id", # Tambahkan jika situs Anda bisa diakses dengan 'www'
    "https://ibupenggeraksidina.id/", # Tambahkan jika ada trailing slash
    # Jika Anda memiliki domain lain yang mengakses API Django Anda, tambahkan di sini
    # Contoh: "https://api.your-other-domain.com",
    # Untuk pengembangan lokal dengan React/Next.js di port 3000:
    # "http://localhost:3000",
    # "http://127.0.0.1:3000",
]

# ALLOWED_HOSTS = ['*']
# # ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'ibupenggeraksidina.id']

# CSRF_TRUSTED_ORIGINS = ["https://ibupenggeraksidina.id",]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'gymease',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'gymease.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'gymease.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'id-id'
TIME_ZONE = 'Asia/Jakarta'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ibupenggeraksidina.id", # Tambahkan domain produksi Anda di sini
    "https://www.ibupenggeraksidina.id", # Tambahkan jika situs Anda bisa diakses dengan 'www'
    "https://gy-system-frontend-kqzk5.ondigitalocean.app"
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_CREDENTIALS = True

# Pengaturan tambahan untuk proxy terbalik (Reverse Proxy) seperti Nginx
# Ini memberi tahu Django bahwa permintaan datang melalui HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Ini memungkinkan Django untuk mempercayai header X-Forwarded-Host
# yang sering digunakan oleh proxy untuk meneruskan host asli
USE_X_FORWARDED_HOST = True