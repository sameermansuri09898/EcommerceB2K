import csv
from django.core.management.base import BaseCommand
from oders.models import colorvarient

class Command(BaseCommand):
  help="Import colors from Csv"
  def handle(self, *args, **kwargs):
    with open('colours.csv',newline='',encoding='utf-8')as file:
      reader=csv.DictReader(file)

      for row in reader:
        colorvarient.objects.get_or_create(
          color=row['name']
        )
    self.stdout.write(
      self.style.SUCCESS(
        'colors import successfully'
      )
    )

    