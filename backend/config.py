from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).parent


class Settings(BaseSettings):
    mongo_uri: str = "mongodb://localhost:27017"
    db_name: str = "kdmcare"
    secret_key: str = "kdmcare-dev-secret"
    models_dir: Path = BASE_DIR / "models"
    data_dir: Path = BASE_DIR / "data"
    
    # Email settings
    mail_username: str = "noreply@kdmcare.hospital"
    mail_password: str = ""
    mail_from: str = "noreply@kdmcare.hospital"
    mail_from_name: str = "KDM Care Hospital"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False
    use_credentials: bool = True
    validate_certs: bool = True

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"


settings = Settings()
