from django.core.management.base import BaseCommand
from conversations.models import Theme, Scenario

class Command(BaseCommand):
    help = 'Populate database with dummy themes and scenarios'

    def handle(self, *args, **options):
        self.stdout.write('Creating dummy themes and scenarios...')
        
        # Create Themes
        themes_data = [
            {
                'title': 'Travel',
                'description': 'Conversations related to traveling, booking flights, hotels, and exploring new places'
            },
            {
                'title': 'Restaurant',
                'description': 'Dining experiences, ordering food, asking about menu items, and restaurant interactions'
            },
            {
                'title': 'Shopping',
                'description': 'Shopping experiences, asking about products, prices, and making purchases'
            },
            {
                'title': 'Healthcare',
                'description': 'Medical appointments, describing symptoms, and healthcare-related conversations'
            },
            {
                'title': 'Work & Business',
                'description': 'Professional meetings, job interviews, and business-related discussions'
            },
            {
                'title': 'Education',
                'description': 'School and university conversations, asking questions, and academic discussions'
            },
            {
                'title': 'Social Events',
                'description': 'Parties, celebrations, and social gatherings'
            },
            {
                'title': 'Transportation',
                'description': 'Using public transport, asking for directions, and travel logistics'
            }
        ]

        created_themes = []
        for theme_data in themes_data:
            theme, created = Theme.objects.get_or_create(
                title=theme_data['title'],
                defaults={'description': theme_data['description']}
            )
            created_themes.append(theme)
            if created:
                self.stdout.write(f'Created theme: {theme.title}')
            else:
                self.stdout.write(f'Theme already exists: {theme.title}')

        # Create Scenarios
        scenarios_data = [
            # Travel scenarios
            {
                'title': 'Airport Check-in',
                'description': 'Checking in for a flight at the airport',
                'theme': 'Travel',
                'teacher_role': 'Airline Agent',
                'student_role': 'Passenger'
            },
            {
                'title': 'Hotel Reservation',
                'description': 'Making a hotel reservation over the phone',
                'theme': 'Travel',
                'teacher_role': 'Hotel Receptionist',
                'student_role': 'Guest'
            },
            {
                'title': 'Asking for Directions',
                'description': 'Asking a local person for directions to a tourist attraction',
                'theme': 'Travel',
                'teacher_role': 'Local Resident',
                'student_role': 'Tourist'
            },
            {
                'title': 'Rental Car',
                'description': 'Renting a car at the airport',
                'theme': 'Travel',
                'teacher_role': 'Car Rental Agent',
                'student_role': 'Customer'
            },

            # Restaurant scenarios
            {
                'title': 'Fine Dining',
                'description': 'Having dinner at an upscale restaurant',
                'theme': 'Restaurant',
                'teacher_role': 'Waiter/Waitress',
                'student_role': 'Customer'
            },
            {
                'title': 'Fast Food Order',
                'description': 'Ordering food at a fast food restaurant',
                'theme': 'Restaurant',
                'teacher_role': 'Cashier',
                'student_role': 'Customer'
            },
            {
                'title': 'Coffee Shop',
                'description': 'Ordering coffee and pastries at a café',
                'theme': 'Restaurant',
                'teacher_role': 'Barista',
                'student_role': 'Customer'
            },
            {
                'title': 'Food Delivery',
                'description': 'Ordering food for delivery over the phone',
                'theme': 'Restaurant',
                'teacher_role': 'Restaurant Staff',
                'student_role': 'Customer'
            },

            # Shopping scenarios
            {
                'title': 'Clothing Store',
                'description': 'Shopping for clothes and asking about sizes',
                'theme': 'Shopping',
                'teacher_role': 'Sales Associate',
                'student_role': 'Customer'
            },
            {
                'title': 'Electronics Store',
                'description': 'Shopping for electronic devices and asking about features',
                'theme': 'Shopping',
                'teacher_role': 'Sales Representative',
                'student_role': 'Customer'
            },
            {
                'title': 'Grocery Shopping',
                'description': 'Shopping for groceries and asking about products',
                'theme': 'Shopping',
                'teacher_role': 'Store Employee',
                'student_role': 'Customer'
            },
            {
                'title': 'Returning Items',
                'description': 'Returning a purchased item to the store',
                'theme': 'Shopping',
                'teacher_role': 'Customer Service Representative',
                'student_role': 'Customer'
            },

            # Healthcare scenarios
            {
                'title': 'Doctor Appointment',
                'description': 'Visiting a doctor for a routine checkup',
                'theme': 'Healthcare',
                'teacher_role': 'Doctor',
                'student_role': 'Patient'
            },
            {
                'title': 'Pharmacy',
                'description': 'Picking up prescription medication at a pharmacy',
                'theme': 'Healthcare',
                'teacher_role': 'Pharmacist',
                'student_role': 'Patient'
            },
            {
                'title': 'Emergency Room',
                'description': 'Visiting the emergency room for urgent medical care',
                'theme': 'Healthcare',
                'teacher_role': 'Nurse',
                'student_role': 'Patient'
            },
            {
                'title': 'Dental Appointment',
                'description': 'Visiting the dentist for a checkup',
                'theme': 'Healthcare',
                'teacher_role': 'Dentist',
                'student_role': 'Patient'
            },

            # Work & Business scenarios
            {
                'title': 'Job Interview',
                'description': 'Attending a job interview',
                'theme': 'Work & Business',
                'teacher_role': 'Interviewer',
                'student_role': 'Job Candidate'
            },
            {
                'title': 'Business Meeting',
                'description': 'Participating in a business meeting',
                'theme': 'Work & Business',
                'teacher_role': 'Meeting Facilitator',
                'student_role': 'Team Member'
            },
            {
                'title': 'Client Presentation',
                'description': 'Presenting a proposal to a potential client',
                'theme': 'Work & Business',
                'teacher_role': 'Client',
                'student_role': 'Sales Representative'
            },
            {
                'title': 'Office Small Talk',
                'description': 'Casual conversation with colleagues at work',
                'theme': 'Work & Business',
                'teacher_role': 'Colleague',
                'student_role': 'Employee'
            },

            # Education scenarios
            {
                'title': 'University Lecture',
                'description': 'Asking questions during a university lecture',
                'theme': 'Education',
                'teacher_role': 'Professor',
                'student_role': 'Student'
            },
            {
                'title': 'Library Help',
                'description': 'Asking for help at the library',
                'theme': 'Education',
                'teacher_role': 'Librarian',
                'student_role': 'Student'
            },
            {
                'title': 'Study Group',
                'description': 'Participating in a study group discussion',
                'theme': 'Education',
                'teacher_role': 'Study Group Leader',
                'student_role': 'Student'
            },
            {
                'title': 'School Registration',
                'description': 'Registering for classes at school',
                'theme': 'Education',
                'teacher_role': 'Registrar',
                'student_role': 'Student'
            },

            # Social Events scenarios
            {
                'title': 'Birthday Party',
                'description': 'Attending a birthday party celebration',
                'theme': 'Social Events',
                'teacher_role': 'Party Host',
                'student_role': 'Guest'
            },
            {
                'title': 'Wedding Reception',
                'description': 'Attending a wedding reception',
                'theme': 'Social Events',
                'teacher_role': 'Wedding Guest',
                'student_role': 'Guest'
            },
            {
                'title': 'Networking Event',
                'description': 'Attending a professional networking event',
                'theme': 'Social Events',
                'teacher_role': 'Event Attendee',
                'student_role': 'Professional'
            },
            {
                'title': 'House Party',
                'description': 'Attending a casual house party',
                'theme': 'Social Events',
                'teacher_role': 'Party Host',
                'student_role': 'Guest'
            },

            # Transportation scenarios
            {
                'title': 'Taxi Ride',
                'description': 'Taking a taxi and giving directions to the driver',
                'theme': 'Transportation',
                'teacher_role': 'Taxi Driver',
                'student_role': 'Passenger'
            },
            {
                'title': 'Bus Stop',
                'description': 'Asking about bus routes and schedules',
                'theme': 'Transportation',
                'teacher_role': 'Bus Driver',
                'student_role': 'Passenger'
            },
            {
                'title': 'Train Station',
                'description': 'Buying train tickets and asking about schedules',
                'theme': 'Transportation',
                'teacher_role': 'Ticket Agent',
                'student_role': 'Passenger'
            },
            {
                'title': 'Gas Station',
                'description': 'Filling up gas and asking for directions',
                'theme': 'Transportation',
                'teacher_role': 'Gas Station Attendant',
                'student_role': 'Driver'
            }
        ]

        created_scenarios = []
        for scenario_data in scenarios_data:
            # Find the theme by title
            theme = next((t for t in created_themes if t.title == scenario_data['theme']), None)
            if not theme:
                self.stdout.write(f'Warning: Theme "{scenario_data["theme"]}" not found for scenario "{scenario_data["title"]}"')
                continue

            scenario, created = Scenario.objects.get_or_create(
                title=scenario_data['title'],
                defaults={
                    'description': scenario_data['description'],
                    'theme': theme,
                    'teacher_role': scenario_data['teacher_role'],
                    'student_role': scenario_data['student_role']
                }
            )
            created_scenarios.append(scenario)
            if created:
                self.stdout.write(f'Created scenario: {scenario.title} (Theme: {theme.title})')
            else:
                self.stdout.write(f'Scenario already exists: {scenario.title}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(created_themes)} themes and {len(created_scenarios)} scenarios!'
            )
        )
