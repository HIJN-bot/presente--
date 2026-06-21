
# Importamos os para acceder a variables de entorno, como la URL base de la API.
import os
# Importamos base64 para codificar la imagen del QR en texto, útil para enviar por red o guardar en la base de datos.
import base64
# Importamos qrcode para generar el código QR a partir de un string (usualmente una URL).
import qrcode
# Importamos BytesIO para manejar imágenes en memoria sin escribir archivos en disco.
from io import BytesIO
# Importamos el schema del QR
from app.schemas.clases.qr_clase_schema import QrCreado


# Clase encargada de la lógica para generar códigos QR y sus datos asociados.
# Se separa en una clase para centralizar la lógica y facilitar pruebas y reutilización.
class ManagerQr:
    def __init__(self):
        self.url_endpoint: str
        self.imagen_qr: str
        self.qr: QrCreado

    def generar_url_qr(self, endpoint: str):
        """
        Este metodo se encarga de construir la URL del QR apuntando al endpoint necesario:
        - Obtenemos la URL del archivo de configuracion
        - Revisamos que efectivamente esa URL exista
        - Concatenamos la URL del QR con el string del endpoint
        - Asignamos al atributo de la URL el valor de la nueva URL a la que apuntara el QR
        """
        # Obtenemos la URL base del Front desde variables de entorno (.env o sistema)
        FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "https://presente-frontend.onrender.com")
        url_endpoint = FRONTEND_BASE_URL.rstrip("/") + endpoint
        # Retornamos la URL final despues de haber concatenado con el endpoint al que debe estar asociado el QR
        self.url_endpoint = url_endpoint
        return url_endpoint

    def generar_qr(self, data: str):
        """
        Este metodo se encarga de generar la imagen en base64 y la asigna al atributo como string
        - Genera un código QR en formato imagen PNG, lo codifica en base64 y lo retorna como string.
        - Esto permite enviar la imagen por red (por ejemplo, en un JSON al frontend) sin manejar archivos.
        - El parámetro 'data' suele ser la URL a la que debe apuntar el QR.
        """
        # Creamos el objeto QRCode con configuración estándar (versión, tamaño, borde)
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        # Añadimos los datos a codificar (usualmente la URL de la clase)
        qr.add_data(data)
        # Generamos la matriz del QR
        qr.make(fit=True)
        # Creamos la imagen del QR en blanco y negro
        img = qr.make_image(fill_color="black", back_color="white")
        # Guardamos la imagen en memoria (no en disco) usando BytesIO
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        # Codificamos la imagen PNG en base64 para poder enviarla como texto (útil para frontend)
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        # Retornamos el string base64, listo para ser usado en un schema o enviado al frontend
        self.imagen_qr = img_base64
        return img_base64

    def crear_qr(self, clase_id: int, endpoint: str, expiracion: str = None):
        """
        Método principal que crea y asigna una instancia de QrCreado como atributo de la clase:
        - Recibe el id de la clase, el endpoint relativo y opcionalmente la expiración.
        - Genera la URL y la imagen QR.
        - Crea el schema QrCreado y lo asigna a self.qr.
        - Retorna la instancia QrCreado lista para enviar al frontend.
        """
        url = self.generar_url_qr(endpoint)
        qr_img = self.generar_qr(url)
        self.qr = QrCreado(url=url, qr_image=qr_img, clase_id=clase_id, expiracion=expiracion)
        return self.qr
