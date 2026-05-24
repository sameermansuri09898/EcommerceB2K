import csv
from django.core.management.base import BaseCommand
from oders.models import sizevarient

class Command(BaseCommand):
  help="Sizes imported"

  def handle(self, *args, **options):
    with open('sizes.csv',newline='',encoding='utf-8')as file:
      reader=csv.DictReader(file)

      for data in reader:
        sizevarient.objects.get_or_create(
          size=data['name']
        )

      self.stdout.write(
      self.style.SUCCESS(
        'colors import successfully'
      )
    )  