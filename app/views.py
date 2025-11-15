from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
import json
from .services import get_all_rows
from .models import KudosLog, KudosView
import re
# Create your views here.


def learners_directory(request):
  """
  Display all learners from the ELO2 Peer Support form responses Google Sheet.
  """
  learners_raw = get_all_rows("Learners Data")
  # Process learners data to normalize keys and split skills
  learners = []
  for learner in learners_raw:
    # Handle timezone column - it may have newline in header name

    
    # Create a normalized version with template-friendly keys
    processed_learner = {
      'name': learner.get('Name', ''),
      'contact_email': learner.get('Contact Email', ''),
      'current_track': learner.get('Current Track', ''),
      'timezone': learner.get('Preferred Timezone\nPlease enter your timezone in UTC format (e.g., UTC+8).', ''),
      'interested_in_peer_review': learner.get('Are you interested in peer reviewing?', ''),
      'current_project': learner.get('Describe your current project (your current project, internship/job responsibilities, or learning goals)', ''),
      'domain': learner.get('Domain', ''),
      'peer_review_frequency': learner.get('How often would you like to participate in peer review?', ''),
      'can_provide_feedback': learner.get('Can you also provide feedback to peers?', ''),
      'skills_to_teach_raw': learner.get('What skills do you have that you could teach/help others with?', ''),
      'hours_per_month': learner.get('How many hours per month can you help peers?', ''),
      'skills_to_learn_raw': learner.get('What skills are you looking to learn or improve', ''),
      'topics_struggling': learner.get('What topics are you struggling to find good materials for', ''),
      'best_times_est': learner.get('Best times for group sessions EST time (Select all that apply)', ''),
      'resource_name': learner.get('Resource name', ''),
      'resource_url': learner.get('Resource URL', ''),
      'topic_area': learner.get('Topic Area', ''),
      'interested_in': learner.get('Would you be interested in participating in: (Select all that apply)', ''),
      'timestamp': learner.get('Timestamp', ''),
    }
    
    # Split skills into lists if they contain commas
    skills_to_teach = processed_learner['skills_to_teach_raw']
    if skills_to_teach and isinstance(skills_to_teach, str):
      processed_learner['skills_to_teach_list'] = [
    s.strip() for s in re.split(r'\s*[,/]\s*', skills_to_teach) if s.strip()
    ]
    else:
      processed_learner['skills_to_teach_list'] = []
    
    skills_to_learn = processed_learner['skills_to_learn_raw']
    if skills_to_learn and isinstance(skills_to_learn, str):
      processed_learner['skills_to_learn_list'] = [
    s.strip() for s in re.split(r'\s*[,/]\s*', skills_to_learn) if s.strip()
]
    else:
      processed_learner['skills_to_learn_list'] = []
    
    learners.append(processed_learner)
  
  # Get kudos counts for each learner
  for learner in learners:
    if learner.get('contact_email'):
      try:
        kudos_view = KudosView.objects.get(to_email=learner['contact_email'])
        learner['kudos_count'] = int(kudos_view.total_count) if kudos_view.total_count else 0
      except KudosView.DoesNotExist:
        learner['kudos_count'] = 0
      reasons = list(
        KudosLog.objects.filter(
          to_email__iexact=learner['contact_email'],
        )
        .exclude(reason__isnull=True)
        .exclude(reason__exact='')
        .order_by('-timestamp')
        .values_list('reason', flat=True)
      )
      learner['kudos_reasons'] = reasons
    else:
      learner['kudos_count'] = 0
      learner['kudos_reasons'] = []
  
  # Sort learners by kudos count (descending - highest first)
  learners.sort(key=lambda x: int(x.get('kudos_count', 0) or 0), reverse=True)
  
  return render(request, 'learners.html', {'learners': learners})


@csrf_exempt
def give_kudos(request):
  """
  API endpoint to give kudos to a learner.
  Validates cooldown (24 hours) and updates kudos_log and kudos_view.
  """
  if request.method != 'POST':
    return JsonResponse({'error': 'Method not allowed'}, status=405)
  
  try:
    data = json.loads(request.body)
    from_email = data.get('from_email', '').strip().lower()
    to_email = data.get('to_email', '').strip().lower()
    reason = data.get('reason', '').strip()
    
    # Validation
    if not from_email or not to_email:
      return JsonResponse({'error': 'Both from_email and to_email are required'}, status=400)
    
    if from_email == to_email:
      return JsonResponse({'error': 'Cannot give kudos to yourself'}, status=400)
    
    # Check cooldown: one kudos from same giver to same receiver per 24 hours
    twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
    recent_kudos = KudosLog.objects.filter(
      from_email=from_email,
      to_email=to_email,
      timestamp__gte=twenty_four_hours_ago
    ).exists()
    
    if recent_kudos:
      return JsonResponse({
        'error': 'You have already given kudos to this person in the last 24 hours. Please wait before giving another kudos.'
      }, status=429)
    
    # Create kudos log entry
    KudosLog.objects.create(
      from_email=from_email,
      to_email=to_email,
      reason=reason if reason else None
    )
    
    # Update or create kudos view (aggregated count)
    kudos_view, created = KudosView.objects.get_or_create(
      to_email=to_email,
      defaults={'total_count': 0}
    )
    kudos_view.total_count += 1
    kudos_view.save()
    
    return JsonResponse({
      'success': True,
      'message': 'Kudos given successfully!',
      'new_total': kudos_view.total_count
    })
    
  except json.JSONDecodeError:
    return JsonResponse({'error': 'Invalid JSON'}, status=400)
  except Exception as e:
    return JsonResponse({'error': str(e)}, status=500)
  
  
def resources_directory(request):
    """
    Display all resources from the Self-Study Resources Google Sheet.
    """
    resources_raw = get_all_rows("Self-Study Resources")
    # Process resources data to normalize keys and split languages
    resources = []
    for resource in resources_raw:

      
      # Create a normalized version with template-friendly keys
      processed_resource = {
        'author': resource.get('Author(s)', ''),
        'resource_name': resource.get('Title', ''),
        'description': resource.get('Description', ''),
        'resource_url': resource.get('Link(s)', ''),
        'languages_raw': resource.get('Language', ''),
        
        
      }
      
      # Filter out empty/invalid resources - must have at least a name or URL
      resource_name = processed_resource['resource_name'].strip() if processed_resource['resource_name'] else ''
      resource_url = processed_resource['resource_url'].strip() if processed_resource['resource_url'] else ''
      
      # Skip this resource if it has no name and no URL
      if not resource_name and not resource_url:
        continue
      
      # Split languages into lists if they contain commas
      languages = processed_resource['languages_raw']
      if languages and isinstance(languages, str):
        processed_resource['languages_list'] = [
      s.strip() for s in re.split(r'\s*[,]\s*', languages) if s.strip()
      ]
      else:
        processed_resource['languages_list'] = []
      
      
      resources.append(processed_resource)
    
    return render(request, 'resources_directory.html', {'resources': resources})