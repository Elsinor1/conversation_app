from django.core.management.base import BaseCommand
from django.db import transaction
from vocabulary.models import VocabularyWord
from users.models import Language, Level
from conversations.models import Theme
import os
from pathlib import Path

class Command(BaseCommand):
    help = 'Populate vocabulary database with German and English dummy data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='backend/vocabulary_dummy_data.txt',
            help='Path to the vocabulary data file'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing vocabulary words before populating'
        )

    def handle(self, *args, **options):
        file_path = options['file']
        
        # Check if file exists
        if not os.path.exists(file_path):
            self.stdout.write(
                self.style.ERROR(f'File not found: {file_path}')
            )
            return

        # Clear existing data if requested
        if options['clear']:
            self.stdout.write('Clearing existing vocabulary words...')
            VocabularyWord.objects.all().delete()
            self.stdout.write(self.style.WARNING('Cleared all existing vocabulary words'))

        self.stdout.write('Creating vocabulary words...')
        
        created_count = 0
        skipped_count = 0
        error_count = 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    
                    # Skip empty lines and comments
                    if not line or line.startswith('#'):
                        continue
                    
                    try:
                        parts = line.split('|')
                        if len(parts) != 5:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'Line {line_num}: Invalid format - {line}'
                                )
                            )
                            error_count += 1
                            continue
                        
                        word, translation, language_name, level_name, theme_name = parts
                        
                        # Get or create language
                        language, lang_created = Language.objects.get_or_create(
                            name=language_name.strip()
                        )
                        if lang_created:
                            self.stdout.write(f'Created language: {language_name}')
                        
                        # Get or create level
                        level, level_created = Level.objects.get_or_create(
                            ABC_value=level_name.strip()
                        )
                        if level_created:
                            self.stdout.write(f'Created level: {level_name}')
                        
                        # Get or create theme
                        theme, theme_created = Theme.objects.get_or_create(
                            title=theme_name.strip()
                        )
                        if theme_created:
                            self.stdout.write(f'Created theme: {theme_name}')
                        
                        # Create vocabulary word
                        vocab_word, created = VocabularyWord.objects.get_or_create(
                            word=word.strip(),
                            translation=translation.strip(),
                            language=language,
                            level=level
                        )
                        
                        # Add theme to the word (many-to-many relationship)
                        vocab_word.theme.add(theme)
                        
                        if created:
                            created_count += 1
                            if created_count % 50 == 0:  # Progress indicator
                                self.stdout.write(f'Created {created_count} words...')
                        else:
                            skipped_count += 1
                            
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(
                                f'Line {line_num}: Error processing - {str(e)}'
                            )
                        )
                        error_count += 1
                        continue
            
            # Summary
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.SUCCESS('Vocabulary population completed!'))
            self.stdout.write(f'✅ Created: {created_count} new vocabulary words')
            self.stdout.write(f'⏭️  Skipped: {skipped_count} existing words')
            self.stdout.write(f'❌ Errors: {error_count} lines with errors')
            
            # Show statistics by language
            self.stdout.write('\n📊 Statistics by Language:')
            for language in Language.objects.all():
                count = VocabularyWord.objects.filter(language=language).count()
                self.stdout.write(f'  {language.name}: {count} words')
            
            # Show statistics by theme
            self.stdout.write('\n📊 Statistics by Theme:')
            for theme in Theme.objects.all():
                count = VocabularyWord.objects.filter(theme=theme).count()
                self.stdout.write(f'  {theme.title}: {count} words')
            
            # Show statistics by level
            self.stdout.write('\n📊 Statistics by Level:')
            for level in Level.objects.all():
                count = VocabularyWord.objects.filter(level=level).count()
                self.stdout.write(f'  {level.ABC_value}: {count} words')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Fatal error: {str(e)}')
            )
            raise

