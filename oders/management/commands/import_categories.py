import csv
from django.core.management.base import BaseCommand
from oders.models import Categoriesvarient

class Command(BaseCommand):
  help="Import catefgorie from Csv"
  def handle(self, *args, **kwargs):
    with open('categories.csv',newline='',encoding='utf-8')as file:
      reader=csv.DictReader(file)

      for row in reader:
        Categoriesvarient.objects.get_or_create(
          categorie=row['name']
        )
    self.stdout.write(
      self.style.SUCCESS(
        'categorie import successfully'
      )
    )

    