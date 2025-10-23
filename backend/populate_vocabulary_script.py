#!/usr/bin/env python3
"""
Standalone script to populate vocabulary database
Run this from the backend directory: python populate_vocabulary_script.py
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'conversation_app.settings')
django.setup()

from vocabulary.models import VocabularyWord
from users.models import Language, Level
from conversations.models import Theme

def populate_vocabulary(file_path='vocabulary_dummy_data.txt', clear_existing=False):
    """
    Populate vocabulary database with dummy data
    
    Args:
        file_path (str): Path to the vocabulary data file
        clear_existing (bool): Whether to clear existing vocabulary words
    """
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f'❌ File not found: {file_path}')
        return False

    # Clear existing data if requested
    if clear_existing:
        print('🗑️  Clearing existing vocabulary words...')
        VocabularyWord.objects.all().delete()
        print('✅ Cleared all existing vocabulary words')

    print('📚 Creating vocabulary words...')
    
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
                        print(f'⚠️  Line {line_num}: Invalid format - {line}')
                        error_count += 1
                        continue
                    
                    word, translation, language_name, level_name, theme_name = parts
                    
                    # Get or create language
                    language, lang_created = Language.objects.get_or_create(
                        name=language_name.strip()
                    )
                    if lang_created:
                        print(f'🌍 Created language: {language_name}')
                    
                    # Get or create level
                    level, level_created = Level.objects.get_or_create(
                        ABC_value=level_name.strip()
                    )
                    if level_created:
                        print(f'📊 Created level: {level_name}')
                    
                    # Get or create theme
                    theme, theme_created = Theme.objects.get_or_create(
                        title=theme_name.strip()
                    )
                    if theme_created:
                        print(f'🎯 Created theme: {theme_name}')
                    
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
                            print(f'📝 Created {created_count} words...')
                    else:
                        skipped_count += 1
                        
                except Exception as e:
                    print(f'❌ Line {line_num}: Error processing - {str(e)}')
                    error_count += 1
                    continue
        
        # Summary
        print('\n' + '='*50)
        print('✅ Vocabulary population completed!')
        print(f'📝 Created: {created_count} new vocabulary words')
        print(f'⏭️  Skipped: {skipped_count} existing words')
        print(f'❌ Errors: {error_count} lines with errors')
        
        # Show statistics by language
        print('\n📊 Statistics by Language:')
        for language in Language.objects.all():
            count = VocabularyWord.objects.filter(language=language).count()
            print(f'  {language.name}: {count} words')
        
        # Show statistics by theme
        print('\n📊 Statistics by Theme:')
        for theme in Theme.objects.all():
            count = VocabularyWord.objects.filter(theme=theme).count()
            print(f'  {theme.title}: {count} words')
        
        # Show statistics by level
        print('\n📊 Statistics by Level:')
        for level in Level.objects.all():
            count = VocabularyWord.objects.filter(level=level).count()
            print(f'  {level.ABC_value}: {count} words')
            
        return True
            
    except Exception as e:
        print(f'💥 Fatal error: {str(e)}')
        return False

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Populate vocabulary database')
    parser.add_argument(
        '--file',
        type=str,
        default='vocabulary_dummy_data.txt',
        help='Path to the vocabulary data file'
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear existing vocabulary words before populating'
    )
    
    args = parser.parse_args()
    
    print('🚀 Starting vocabulary population...')
    success = populate_vocabulary(args.file, args.clear)
    
    if success:
        print('\n🎉 Population completed successfully!')
    else:
        print('\n💥 Population failed!')
        sys.exit(1)
