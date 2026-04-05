from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import timedelta, date, datetime
import random
from apps.products.models import Category, Product
from apps.floors.models import Floor, Table
from apps.payment_methods.models import PaymentMethod
from apps.bookings.models import Booking
from apps.orders.models import Order, OrderItem, Payment

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with comprehensive demo data (15+ items per section)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Clearing old data...'))
        Order.objects.all().delete()
        Booking.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Table.objects.all().delete()
        Floor.objects.all().delete()
        User.objects.exclude(username='admin').delete()
        
        today = date.today()

        # Users
        manager = User.objects.create_user(username='manager', email='manager@poscafe.com', password='manager@123', role='admin', is_staff=True, is_superuser=True)
        staff = User.objects.create_user(username='staff', email='staff@poscafe.com', password='staff@123', role='staff')
        kitchen = User.objects.create_user(username='kitchen', email='kitchen@poscafe.com', password='kitchen123', role='kitchen')
        self.stdout.write(self.style.SUCCESS('[OK] Users created'))

        # Categories
        cat_beverages = Category.objects.create(name='Beverages', description='Hot & cold drinks')
        cat_food = Category.objects.create(name='Food', description='Main courses & snacks')
        cat_desserts = Category.objects.create(name='Desserts', description='Sweet treats')
        cat_starters = Category.objects.create(name='Starters', description='Appetizers')
        cat_specials = Category.objects.create(name='Chef Specials', description='Signature dishes')

        # Products (20 items)
        products_data = [
            {'name': 'Espresso', 'category': cat_beverages, 'price': 120, 'tax_percent': 5},
            {'name': 'Cappuccino', 'category': cat_beverages, 'price': 180, 'tax_percent': 5},
            {'name': 'Latte', 'category': cat_beverages, 'price': 200, 'tax_percent': 5},
            {'name': 'Green Tea', 'category': cat_beverages, 'price': 100, 'tax_percent': 5},
            {'name': 'Fresh Orange Juice', 'category': cat_beverages, 'price': 150, 'tax_percent': 5},
            {'name': 'Iced Caramel Macchiato', 'category': cat_beverages, 'price': 220, 'tax_percent': 5},
            {'name': 'Margherita Pizza', 'category': cat_food, 'price': 350, 'tax_percent': 5},
            {'name': 'Pepperoni Pizza', 'category': cat_food, 'price': 450, 'tax_percent': 5},
            {'name': 'Chicken Burger', 'category': cat_food, 'price': 280, 'tax_percent': 5},
            {'name': 'Veg Wrap', 'category': cat_food, 'price': 220, 'tax_percent': 5},
            {'name': 'Pasta Alfredo', 'category': cat_food, 'price': 320, 'tax_percent': 5},
            {'name': 'Spicy Arrabbiata', 'category': cat_food, 'price': 340, 'tax_percent': 5},
            {'name': 'Caesar Salad', 'category': cat_starters, 'price': 250, 'tax_percent': 5},
            {'name': 'Garlic Bread', 'category': cat_starters, 'price': 150, 'tax_percent': 5},
            {'name': 'Soup of the Day', 'category': cat_starters, 'price': 180, 'tax_percent': 5},
            {'name': 'Nachos with Cheese', 'category': cat_starters, 'price': 240, 'tax_percent': 5},
            {'name': 'Chocolate Brownie', 'category': cat_desserts, 'price': 200, 'tax_percent': 5},
            {'name': 'Cheesecake', 'category': cat_desserts, 'price': 280, 'tax_percent': 5},
            {'name': 'Ice Cream Sundae', 'category': cat_desserts, 'price': 220, 'tax_percent': 5},
            {'name': 'Tiramisu', 'category': cat_specials, 'price': 350, 'tax_percent': 5},
            {'name': 'Truffle Mushroom Risotto', 'category': cat_specials, 'price': 480, 'tax_percent': 5},
        ]
        db_products = []
        for p in products_data:
            db_products.append(Product.objects.create(**p))
        self.stdout.write(self.style.SUCCESS('[OK] Products created (21 items)'))

        # Floors & Tables (15 items)
        ground = Floor.objects.create(name='Ground Floor')
        first = Floor.objects.create(name='First Floor')
        terrace = Floor.objects.create(name='Terrace')
        db_tables = []
        for i in range(1, 7): db_tables.append(Table.objects.create(floor=ground, table_number=str(i), seats=4))
        for i in range(7, 12): db_tables.append(Table.objects.create(floor=first, table_number=str(i), seats=4))
        for i in range(12, 16): db_tables.append(Table.objects.create(floor=terrace, table_number=str(i), seats=6))
        self.stdout.write(self.style.SUCCESS('[OK] Floors (3) & Tables (15) created'))

        # Payment Methods
        cash, _ = PaymentMethod.objects.get_or_create(name='Cash', defaults={'is_enabled': True})
        digital, _ = PaymentMethod.objects.get_or_create(name='Digital', defaults={'is_enabled': True})
        upi, _ = PaymentMethod.objects.get_or_create(name='UPI', defaults={'is_enabled': True, 'upi_id': '123@ybl.com'})
        
        # Bookings (15 items)
        import datetime as dt
        names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Kevin', 'Liam', 'Mia', 'Noah', 'Olivia']
        for i in range(15):
            days_offset = random.randint(-5, 5) # some past, some today, some future
            b_date = today + timedelta(days=days_offset)
            start_h = random.randint(10, 20)
            status = 'completed' if days_offset < 0 else ('confirmed' if days_offset > 0 else random.choice(['confirmed', 'seated']))
            Booking.objects.create(
                customer_name=f"{names[i]} Smith",
                customer_phone=f"555-010{i}",
                party_size=random.randint(2, 6),
                table=random.choice(db_tables),
                booking_date=b_date,
                time_slot_start=dt.time(start_h, 0),
                time_slot_end=dt.time(start_h+1, 0),
                status=status,
                created_by=manager
            )
        self.stdout.write(self.style.SUCCESS('[OK] Bookings created (15 items)'))

        # Orders & Payments (15 items generated for today to populate dashboard)
        for i in range(15):
            table = random.choice(db_tables)
            is_paid = random.choice([True, True, True, False]) # 75% paid
            status = 'paid' if is_paid else random.choice(['sent', 'preparing', 'served'])
            pay_status = 'done' if is_paid else 'pending'
            
            order = Order.objects.create(
                order_number=f"{(1000+i)}", 
                table=table, 
                created_by=staff, 
                status=status, 
                payment_status=pay_status
            )
            
            # Add 2-4 items per order
            total_amount = 0
            for _ in range(random.randint(2, 4)):
                prod = random.choice(db_products)
                qty = random.randint(1, 3)
                subtotal = prod.price * qty
                total_amount += subtotal
                OrderItem.objects.create(
                    order=order, product=prod, quantity=qty, 
                    unit_price=prod.price, subtotal=subtotal,
                    kitchen_status='completed' if status in ['served', 'paid'] else 'to_cook',
                    is_prepared=(status in ['served', 'paid'])
                )
            
            if is_paid:
                Payment.objects.create(
                    order=order, method=random.choice([cash, digital, upi]),
                    amount=total_amount, status='confirmed', paid_at=datetime.now()
                )
                
        self.stdout.write(self.style.SUCCESS('[OK] Orders & Payments created (15 items)'))

        self.stdout.write(self.style.WARNING('\nCredentials:'))
        self.stdout.write(f'  Manager: manager / manager@123')
        self.stdout.write(f'  Staff:   staff / staff@123')
        self.stdout.write(f'  Kitchen: kitchen / kitchen123')

