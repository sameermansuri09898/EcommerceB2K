import csv
import requests

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files import File

from oders.models import (
    Product,
    variant,
    Categoriesvarient,
    colorvarient,
    sizevarient
)

from Account.models import CustomUser


class Command(BaseCommand):

    help = "Import Products and Variants from CSV"

    def handle(self, *args, **kwargs):

        # ==========================================
        # GET USER
        # ==========================================

        try:

            user = CustomUser.objects.get(id=14)

        except CustomUser.DoesNotExist:

            self.stdout.write(
                self.style.ERROR(
                    "User with id=14 not found"
                )
            )

            return

        # ==========================================
        # REQUEST HEADERS
        # ==========================================

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        # ==========================================
        # IMPORT PRODUCTS CSV
        # ==========================================

        self.stdout.write(
            self.style.WARNING(
                "Importing Products..."
            )
        )

        with open(
            'csv/productdata.csv',
            newline='',
            encoding='utf-8'
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                try:

                    # ==========================================
                    # CATEGORY GET OR CREATE
                    # ==========================================

                    category_name = row['category'].strip()

                    category, created = Categoriesvarient.objects.get_or_create(
                        categorie=category_name
                    )

                    # ==========================================
                    # CREATE PRODUCT
                    # ==========================================

                    product = Product.objects.create(

                        user=user,

                        name=row['name'].strip(),

                        brand=row['brand'].strip(),

                        description=row['description'].strip(),

                        category=category
                    )

                    # ==========================================
                    # PRODUCT IMAGE DOWNLOAD
                    # ==========================================

                    image_url = row['image_url'].strip()

                    try:

                        response = requests.get(
                            image_url,
                            timeout=10,
                            headers=headers
                        )

                        # SUCCESS IMAGE DOWNLOAD
                        if response.status_code == 200:

                            product.product_image.save(

                                f"product_{product.id}.jpg",

                                ContentFile(response.content),

                                save=True
                            )

                        # FAILED IMAGE DOWNLOAD
                        else:

                            raise Exception(
                                f"Status Code {response.status_code}"
                            )

                    except Exception as e:

                        print(
                            f"Product Image Error ({product.name}): {e}"
                        )

                        # ==========================================
                        # DEFAULT IMAGE SAVE
                        # ==========================================

                        with open(
                            'media/defaults/product.jpg',
                            'rb'
                        ) as f:

                            product.product_image.save(

                                f"default_product_{product.id}.jpg",

                                File(f),

                                save=True
                            )

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Product Created: {product.name}"
                        )
                    )

                except Exception as e:

                    print(
                        f"Product Import Error: {e}"
                    )

        # ==========================================
        # IMPORT VARIANTS CSV
        # ==========================================

        self.stdout.write(
            self.style.WARNING(
                "Importing Variants..."
            )
        )

        with open(
            'csv/variantsdata.csv',
            newline='',
            encoding='utf-8'
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                try:

                    # ==========================================
                    # GET PRODUCT
                    # ==========================================

                    try:

                        product = Product.objects.get(
                            name=row['product_name'].strip()
                        )

                    except Product.DoesNotExist:

                        print(
                            f"Product Not Found: {row['product_name']}"
                        )

                        continue

                    # ==========================================
                    # COLOR GET OR CREATE
                    # ==========================================

                    color_name = row['color'].strip()

                    color_obj, created = colorvarient.objects.get_or_create(
                        color=color_name
                    )

                    # ==========================================
                    # SIZE GET OR CREATE
                    # ==========================================

                    size_name = row['size'].strip()

                    size_obj, created = sizevarient.objects.get_or_create(
                        size=size_name
                    )

                    # ==========================================
                    # SAFE INTEGER CONVERSION
                    # ==========================================

                    price = int(row['price'])

                    offer = int(row['offer'])

                    stock = int(row['stock'])

                    # ==========================================
                    # CREATE VARIANT
                    # ==========================================

                    product_variant = variant.objects.create(

                        seller=user,

                        product=product,

                        colors=color_obj,

                        sizes=size_obj,

                        price=price,

                        offer=offer,

                        stock=stock
                    )

                    # ==========================================
                    # VARIANT IMAGE DOWNLOAD
                    # ==========================================

                    image_url = row['image_url'].strip()

                    try:

                        response = requests.get(
                            image_url,
                            timeout=10,
                            headers=headers
                        )

                        # SUCCESS
                        if response.status_code == 200:

                            product_variant.images.save(

                                f"variant_{product_variant.id}.jpg",

                                ContentFile(response.content),

                                save=True
                            )

                        # FAILED
                        else:

                            raise Exception(
                                f"Status Code {response.status_code}"
                            )

                    except Exception as e:

                        print(
                            f"Variant Image Error ({product.name}): {e}"
                        )

                        # ==========================================
                        # SAVE DEFAULT VARIANT IMAGE
                        # ==========================================

                        with open(
                            'media/defaults/variant.jpg',
                            'rb'
                        ) as f:

                            product_variant.images.save(

                                f"default_variant_{product_variant.id}.jpg",

                                File(f),

                                save=True
                            )

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Variant Created: {product.name}"
                        )
                    )

                except Exception as e:

                    print(
                        f"Variant Import Error: {e}"
                    )

        # ==========================================
        # FINISHED
        # ==========================================

        self.stdout.write(
            self.style.SUCCESS(
                "All Products and Variants Imported Successfully"
            )
        )