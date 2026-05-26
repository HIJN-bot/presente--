# Importamos os para obtener del archivo de configuracion la ruta
import os

# Importamos base64 para guardar el codigo QR
import base64

# Importamos qrcode para poder generar el codigo QR
import qrcode

# Importamos de io BytesIO
from io import BytesIO


class ManagerQr:
    def __init__(self):
        pass

    def generar_url_qr(self, clase_id: int) -> str:
        """
        Este metodo se encarga de obtener la URL para generar el codigo QR:
        - Obtiene la URL desde el archivo de configuracion
        - Retorna la ruta con el endpoint para crear la URL del QR
        """
        # Obtenemos la URL del archivo de configuracion
        API_BASE_URL = os.getenv(
            "API_BASE_URL",
        )
        # Caso en el que no haya URL en el archivo de configuracion
        if not API_BASE_URL:
            raise RuntimeError("La variable 'API_BASE_URL' no esta definida")
        # Retornoamos la URL
        return API_BASE_URL

    def generar_qr(data: str) -> str:
        """
        Este metodo se encarga de generar el codigo QR en base64 a partir de un string (usualmente una URL):
        - Crea el objeto QRCode con la configuracion deseada
        - Añade los datos a codificar (por lo general la URL)
        - Genera la matriz del QR
        - Crea la imagen del QR en blanco y negro
        - Guarda la imagen en memoria usando BytesIO
        - Codifica la imagen PNG en base64 para poder enviarla como texto
        - Retorna el string base64 listo para guardar en la base de datos o enviar al frontend
        """
        # Creamos el objeto QRCode con la configuracion deseada
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        # Añadimos los datos que queremos codificar (usualmente la URL)
        qr.add_data(data)
        # Generamos la matriz del QR
        qr.make(fit=True)
        # Creamos la imagen del QR en blanco y negro
        img = qr.make_image(fill_color="black", back_color="white")
        # Guardamos la imagen en memoria (no en disco) usando BytesIO
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        # Codificamos la imagen PNG en base64 para poder enviarla como texto
        img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
        # Retornamos el string base64
        return img_base64
