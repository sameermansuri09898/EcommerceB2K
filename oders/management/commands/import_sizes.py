import csv
from django.core.management.base import BaseCommand
from oders.models import sizevarient

class Command(BaseCommand):
  help="Import Sizes from Csv"
  def handle(self, *args, **kwargs):
    with open('sizes.csv',newline='',encoding='utf-8')as file:
      reader=csv.DictReader(file)

      for row in reader:
        sizevarient.objects.get_or_create(
          color=row['name']
        )
    self.stdout.write(
      self.style.SUCCESS(
        'Sizes import successfully'
      )
    )

    