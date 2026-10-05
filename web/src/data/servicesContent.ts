import { ASSETS } from '../assets';

export interface ServiceFAQ {
  q: string;
  a: string;
}

export interface ServiceContent {
  id: string;
  slug: string;
  title: string;
  shortProposition: string;
  explanation: string;
  primaryCTA: string;
  secondaryCTA?: string;
  heroImage: string;
  
  // The Farmer Problem
  problemHeading: string;
  problems: string[];
  
  // What is this service
  whatItIs: string;
  whatItDoes: string;
  whatIsRequired: string;
  whatResult: string;
  
  // How it works
  workflowSteps: string[];
  
  // What you get
  outputs: string[];
  
  // Who is it for
  targetAudience: string[];
  
  // When should you use it
  timing: string;
  
  // Benefits
  benefits: string[];
  
  // Real Example
  exampleProblem: string;
  exampleAction: string;
  exampleAssistance: string;
  exampleResult: string;
  
  // Who provides it
  provider: string;
  
  // Requirements
  requirements: string[];
  
  // Trust/Safety
  trustElements: string[];
  
  // FAQ
  faqs: ServiceFAQ[];
  
  // Related
  relatedServices: string[];
  
  // SEO
  metaTitle: string;
  metaDescription: string;
}

export const servicesContent: Record<string, ServiceContent> = {
  'crop-planning': {
    id: 'crop-planning',
    slug: 'crop-planning',
    title: 'Crop Planning',
    shortProposition: 'Plan the right crop for the right land, season and goal.',
    explanation: 'Get practical guidance for selecting crops, planning cultivation and building a better farming strategy to maximize yield and profitability.',
    primaryCTA: 'Start Crop Planning',
    secondaryCTA: 'Talk to an Expert',
    heroImage: ASSETS.SERVICES.ORCHARD_PLANNING,
    
    problemHeading: 'Planning a crop is more than choosing a seed.',
    problems: [
      'Wrong crop selection for local soil',
      'Poor planning for climate and water availability',
      'Unclear planting and harvesting timelines',
      'Unexpected input costs leading to loss',
      'Lack of professional expert guidance'
    ],
    
    whatItIs: 'A professional planning service to help you decide what to grow.',
    whatItDoes: 'Analyzes your farm details to recommend the most profitable and sustainable crops.',
    whatIsRequired: 'Basic details about your land size, soil type, and location.',
    whatResult: 'A clear, step-by-step crop establishment and cultivation plan.',
    
    workflowSteps: [
      'Tell us about your farm',
      'Add location, crop history, and soil info',
      'Get tailored crop recommendations',
      'Review with an agriculture expert if required',
      'Start farming with a clear plan'
    ],
    
    outputs: [
      'Crop suitability guidance',
      'Seasonal recommendations',
      'Profitable crop selection',
      'Step-by-step planting plan',
      'Expected timeline',
      'Basic input planning',
      'Expert review options'
    ],
    
    targetAudience: [
      'New farmers starting their journey',
      'Existing farmers looking to diversify',
      'Orchard farmers establishing long-term crops',
      'Commercial farmers planning large-scale operations',
      'Small landholders maximizing limited space',
      'Farmers changing crops this season'
    ],
    
    timing: 'Before the season begins or when considering a change in your farming strategy.',
    
    benefits: [
      'Save time and money by making informed choices',
      'Reduce uncertainty with data-driven decisions',
      'Make better, more profitable farming decisions',
      'Improve season-long planning',
      'Access agricultural experts directly',
      'Reduce avoidable losses from bad crop choices'
    ],
    
    exampleProblem: 'Ramesh wants to cultivate a new cash crop on his 3-acre land but doesn\'t know which crop will survive the upcoming dry season.',
    exampleAction: 'He submits his farm location, soil type, and water availability to Kissan Mithar.',
    exampleAssistance: 'The system and experts analyze his farm profile and recommend drought-resistant millets, providing a full cultivation timeline.',
    exampleResult: 'Ramesh successfully grows a high-yield crop with lower water requirements, avoiding the losses his neighbors faced.',
    
    provider: 'Agricultural experts + Kissan Mithar platform data',
    
    requirements: [
      'Farm location and district',
      'Land size (acres/hectares)',
      'Current or previous crop planted',
      'Soil information (if available)',
      'Water availability (borewell/canal/rainfed)',
      'Farming objective (commercial/subsistence)'
    ],
    
    trustElements: [
      'Expert verified recommendations',
      'Data-backed agricultural science',
      'Transparent planning process',
      'Your farm data is strictly protected',
      'Direct human assistance when needed'
    ],
    
    faqs: [
      { q: 'What information do I need to start?', a: 'Just your farm location, size, and basic soil/water details.' },
      { q: 'Who can use this service?', a: 'Any farmer, whether small-scale or commercial, looking to optimize their crop choice.' },
      { q: 'How long does it take to get a plan?', a: 'Initial recommendations are instant, while expert reviews take 24-48 hours.' },
      { q: 'Is expert consultation included?', a: 'Yes, you can opt for an expert to review your automated plan.' },
      { q: 'Can I use this from my mobile?', a: 'Absolutely, the entire process is mobile-friendly.' },
      { q: 'What languages are supported?', a: 'English, Telugu, and Hindi.' },
      { q: 'Is the service available in my location?', a: 'Yes, it is available for all districts covered by Kissan Mithar.' }
    ],
    
    relatedServices: ['expert-consultancy', 'fertilizer-guide', 'weather', 'disease-help'],
    
    metaTitle: 'Crop Planning Services | Kissan Mithar',
    metaDescription: 'Plan your crops with practical farming guidance, seasonal recommendations and expert support from Kissan Mithar.'
  },
  
  'expert-consultancy': {
    id: 'expert-consultancy',
    slug: 'expert-consultancy',
    title: 'Expert Consultancy',
    shortProposition: 'Direct access to verified agricultural experts.',
    explanation: 'Skip the guesswork. Talk directly to experienced agronomists and agricultural scientists to solve your farming challenges.',
    primaryCTA: 'Talk to an Agriculture Expert',
    heroImage: ASSETS.SERVICES.EXPERT_CONSULTANCY,
    
    problemHeading: 'Farming challenges need real expertise, not just internet searches.',
    problems: [
      'Conflicting advice from local shops',
      'Complex disease symptoms that are hard to diagnose',
      'Uncertainty about new farming techniques',
      'Lack of access to professional agronomists'
    ],
    
    whatItIs: 'A direct communication channel to verified agricultural experts.',
    whatItDoes: 'Connects you with a professional who can diagnose issues, recommend treatments, and guide your farming strategy.',
    whatIsRequired: 'A description of your problem and optional photos of your crop.',
    whatResult: 'Actionable, professional advice tailored to your exact situation.',
    
    workflowSteps: [
      'Select your topic of concern (disease, fertilizer, etc.)',
      'Briefly describe the issue and upload photos',
      'Choose your preferred contact method (Call, Chat, Video)',
      'Connect with a verified agriculture expert',
      'Receive a detailed digital prescription/advice'
    ],
    
    outputs: [
      'Direct one-to-one consultation',
      'Professional diagnosis of crop issues',
      'Written prescription for treatments',
      'Strategic farming guidance',
      'Follow-up support options'
    ],
    
    targetAudience: [
      'Farmers facing unidentified crop diseases',
      'Farmers looking to optimize fertilizer usage',
      'Anyone needing a second opinion on farming practices',
      'Commercial growers needing specialized advice'
    ],
    
    timing: 'Whenever you face a farming challenge you cannot confidently solve yourself, or when planning a major agricultural investment.',
    
    benefits: [
      'Save crops by getting accurate, timely diagnoses',
      'Reduce money wasted on wrong chemicals or fertilizers',
      'Access university-level expertise from your phone',
      'Get advice in your local language',
      'Build a relationship with trusted advisors'
    ],
    
    exampleProblem: 'Sunita notices sudden yellowing in her tomato crop but local shops recommend three different expensive chemical sprays.',
    exampleAction: 'She books a video call with a Kissan Mithar expert and shows the affected leaves.',
    exampleAssistance: 'The expert identifies it as a specific nutrient deficiency, not a disease.',
    exampleResult: 'Sunita applies a targeted, low-cost micronutrient spray. The crop recovers, and she saves money on unnecessary chemicals.',
    
    provider: 'Verified agricultural experts and agronomists',
    
    requirements: [
      'Clear description of the problem',
      'Photos or video of the affected crop (if applicable)',
      'Details of any chemicals/fertilizers already used',
      'Crop stage and age'
    ],
    
    trustElements: [
      'All experts are strictly verified professionals',
      'Advice is recorded for your future reference',
      'Transparent rating and feedback system',
      'No hidden commissions on recommended products'
    ],
    
    faqs: [
      { q: 'Who are the experts?', a: 'They are verified agronomists, retired agricultural officers, and university researchers.' },
      { q: 'Can I talk to them in Telugu?', a: 'Yes, you can select experts based on your preferred language.' },
      { q: 'How long does a consultation last?', a: 'Typically 15-30 minutes, depending on the complexity of the issue.' },
      { q: 'Is video calling supported?', a: 'Yes, video calls are highly recommended for disease diagnosis.' },
      { q: 'Will I get a written summary?', a: 'Yes, a digital prescription is provided after the call.' }
    ],
    
    relatedServices: ['disease-help', 'fertilizer-guide', 'crop-planning'],
    
    metaTitle: 'Agricultural Expert Consultancy | Kissan Mithar',
    metaDescription: 'Talk directly to verified agriculture experts via call, chat, or video for professional farming advice.'
  },

  'fertilizer-guide': {
    id: 'fertilizer-guide',
    slug: 'fertilizer-guide',
    title: 'Fertilizer Guide',
    shortProposition: 'The right nutrients, in the right amount, at the right time.',
    explanation: 'Get crop-specific, growth-stage accurate fertilizer recommendations to boost your yield while saving money on unnecessary inputs.',
    primaryCTA: 'Get Your Fertilizer Guidance',
    heroImage: ASSETS.SERVICES.FERTILIZERS,
    
    problemHeading: 'Blind fertilizer application hurts your soil and your wallet.',
    problems: [
      'Overusing costly chemical fertilizers',
      'Applying the wrong nutrients for the current growth stage',
      'Damaging long-term soil health',
      'Relying on generic advice from fertilizer sellers'
    ],
    
    whatItIs: 'A smart calculator and guide for crop nutrition.',
    whatItDoes: 'Calculates the exact NPK and micronutrient requirements based on your specific crop, age, and soil condition.',
    whatIsRequired: 'Crop name, planting date, and land size.',
    whatResult: 'A customized, easy-to-follow fertilizer application schedule.',
    
    workflowSteps: [
      'Select your crop and its current age/stage',
      'Input your land size and soil type',
      'Review the calculated nutrient requirements',
      'Get a list of recommended fertilizer combinations',
      'Follow the application schedule for optimal growth'
    ],
    
    outputs: [
      'Crop-specific fertilizer recommendations',
      'Growth-stage nutrient planning',
      'Exact dosage calculations per acre/hectare',
      'Alternative organic/chemical options',
      'Application method guidance'
    ],
    
    targetAudience: [
      'Farmers wanting to optimize input costs',
      'Farmers transitioning to balanced nutrition',
      'Growers looking to maximize yield potential',
      'Anyone confused by complex fertilizer formulations'
    ],
    
    timing: 'Before fertilizer application and during key crop transitions (e.g., vegetative to flowering stage).',
    
    benefits: [
      'Save money by avoiding unnecessary fertilizer use',
      'Improve crop health with balanced nutrition',
      'Protect soil health from chemical burn',
      'Increase yield through precise timing',
      'Reduce environmental impact'
    ],
    
    exampleProblem: 'Kiran usually applies 3 bags of Urea per acre for his paddy, but his yield has plateaued and costs are rising.',
    exampleAction: 'He uses the Fertilizer Guide for his specific paddy variety and soil type.',
    exampleAssistance: 'The guide reveals he is over-applying Nitrogen but completely lacking Zinc.',
    exampleResult: 'Kiran reduces his Urea application by 30% and adds a small, cheap zinc supplement. His yield increases by 15% while spending less overall.',
    
    provider: 'Kissan Mithar Agronomy Engine + Expert Oversight',
    
    requirements: [
      'Crop type and variety',
      'Date of sowing / current crop stage',
      'Total farming area',
      'Recent soil test results (optional but recommended)'
    ],
    
    trustElements: [
      'Based on official agricultural university guidelines',
      'No bias toward specific fertilizer brands',
      'Calculations adapt to local soil baselines',
      'Option to have the plan reviewed by a human expert'
    ],
    
    faqs: [
      { q: 'Do I need a soil test to use this?', a: 'No, but providing a soil test makes the recommendations 100% accurate. Otherwise, we use regional soil averages.' },
      { q: 'Does it support organic farming?', a: 'Yes, you can choose to receive organic nutrient recommendations (like FYM, Vermicompost).' },
      { q: 'Can it calculate for mixed crops?', a: 'Yes, it provides balanced guidance for intercropping scenarios.' },
      { q: 'Does it recommend specific brands?', a: 'No, we recommend nutrient compositions (e.g., NPK 19:19:19), leaving brand choice to you.' }
    ],
    
    relatedServices: ['crop-planning', 'expert-consultancy', 'disease-help'],
    
    metaTitle: 'Crop Fertilizer Guide & Calculator | Kissan Mithar',
    metaDescription: 'Get accurate, crop-specific fertilizer recommendations to improve yield and reduce unnecessary farming input costs.'
  },

  'disease-help': {
    id: 'disease-help',
    slug: 'disease-help',
    title: 'Disease Help',
    shortProposition: 'Identify crop problems fast. Treat them right.',
    explanation: 'Quickly diagnose pests, diseases, and nutrient deficiencies affecting your crops, and get immediate, effective treatment guidance.',
    primaryCTA: 'Identify Your Crop Problem',
    heroImage: ASSETS.SERVICES.DISEASE_HELP,
    
    problemHeading: 'A small pest problem today is a destroyed crop tomorrow.',
    problems: [
      'Inability to identify strange spots on leaves',
      'Applying the wrong pesticide, wasting time and money',
      'Rapid spread of disease across the farm',
      'Panic-buying expensive chemicals'
    ],
    
    whatItIs: 'A visual diagnostic tool and expert escalation service.',
    whatItDoes: 'Helps you identify the exact pest or disease attacking your crop using photos and symptoms.',
    whatIsRequired: 'Clear photos of the affected plant parts and a brief description.',
    whatResult: 'Identification of the problem and a step-by-step treatment plan.',
    
    workflowSteps: [
      'Take clear photos of the affected leaves, fruit, or stem',
      'Submit the photos with your crop details',
      'Get an automated initial identification',
      'Receive a verified treatment direction',
      'Escalate to a human expert for complex cases'
    ],
    
    outputs: [
      'Pest and disease identification',
      'Recommended treatment direction',
      'Chemical and organic spray guidance',
      'Preventative measures for the future',
      'Direct escalation to human experts'
    ],
    
    targetAudience: [
      'Farmers noticing unusual changes in their crops',
      'Growers dealing with sudden pest attacks',
      'Anyone wanting a second opinion before spraying harsh chemicals'
    ],
    
    timing: 'Immediately after noticing any symptoms like yellowing leaves, spots, wilting, or visible insects.',
    
    benefits: [
      'Stop crop loss by acting quickly and correctly',
      'Save money by buying only the pesticide you actually need',
      'Prevent diseases from spreading to healthy plants',
      'Learn how to identify issues yourself in the future'
    ],
    
    exampleProblem: 'Ravi\'s chilli crop develops white powdery spots on the leaves, and the flowers are dropping.',
    exampleAction: 'He takes three close-up photos and submits them through the Disease Help service.',
    exampleAssistance: 'The system identifies Powdery Mildew. It provides the exact fungicide composition required and instructions on when to spray.',
    exampleResult: 'Ravi sprays the correct fungicide that evening. The spread stops within 48 hours, saving his harvest.',
    
    provider: 'Kissan Mithar AI Diagnostics + Verified Agronomists',
    
    requirements: [
      'Clear, in-focus photos of the problem',
      'Name of the crop and its age',
      'When the symptoms first appeared',
      'Any treatments already attempted'
    ],
    
    trustElements: [
      'Diagnoses are backed by agricultural science',
      'Seamless escalation to human experts if the AI is unsure',
      'Treatment recommendations prioritize safety and efficacy'
    ],
    
    faqs: [
      { q: 'How quickly will I get an answer?', a: 'Initial diagnostic results are instant. Expert reviews take less than 4 hours.' },
      { q: 'What if the photo isn\'t clear?', a: 'The system will ask you to retake it and provide tips for a good photo.' },
      { q: 'Do you sell the pesticides recommended?', a: 'No, we provide the chemical composition so you can buy locally from any brand.' },
      { q: 'Can it identify nutrient deficiencies?', a: 'Yes, it can differentiate between pests, diseases, and nutrient issues.' }
    ],
    
    relatedServices: ['expert-consultancy', 'ai-farming-assistant', 'fertilizer-guide'],
    
    metaTitle: 'Crop Disease Identification & Help | Kissan Mithar',
    metaDescription: 'Identify crop diseases, pests, and nutrient deficiencies quickly. Get expert treatment guidance to save your harvest.'
  },

  'weather': {
    id: 'weather',
    slug: 'weather',
    title: 'Farming Weather',
    shortProposition: 'Hyper-local weather for smarter farming decisions.',
    explanation: 'Don\'t let unexpected rain wash away your expensive fertilizer. Get precise weather forecasts and farming-specific alerts for your exact location.',
    primaryCTA: 'Check Today\'s Farming Weather',
    heroImage: ASSETS.SERVICES.WEATHER,
    
    problemHeading: 'The weather controls the farm. You need to know what it\'s doing.',
    problems: [
      'Spraying pesticides right before unexpected rain',
      'Irrigating a day before heavy showers',
      'Crop damage from unpredicted storms or frost',
      'Generic weather apps that aren\'t accurate for rural areas'
    ],
    
    whatItIs: 'A hyper-local, agriculture-focused weather forecasting tool.',
    whatItDoes: 'Provides current conditions, 7-day forecasts, and specific advice on whether it is safe to perform farm activities.',
    whatIsRequired: 'Your farm\'s GPS location or village name.',
    whatResult: 'Clear "Yes/No" guidance for daily farming activities based on weather.',
    
    workflowSteps: [
      'Allow location access or search for your village',
      'View current temperature, humidity, and wind speed',
      'Check the rain probability for the next 48 hours',
      'Review activity guidance (e.g., "Not ideal for spraying today")',
      'Plan your farm labor and operations accordingly'
    ],
    
    outputs: [
      'Current hyper-local weather',
      '7-day detailed forecast',
      'Farming alerts (heavy rain, heatwave, frost)',
      'Activity guidance for irrigation',
      'Activity guidance for spraying',
      'Activity guidance for harvesting'
    ],
    
    targetAudience: [
      'Every farmer, every single day',
      'Farmers planning expensive spraying operations',
      'Farmers managing critical harvest windows',
      'Anyone dependent on rain-fed agriculture'
    ],
    
    timing: 'Every morning before assigning labor, and specifically before irrigation, spraying, harvesting, or sowing.',
    
    benefits: [
      'Never waste money spraying chemicals before rain',
      'Save water and electricity by predicting natural rainfall',
      'Protect harvested crops from sudden storms',
      'Improve labor efficiency by planning around extreme heat'
    ],
    
    exampleProblem: 'Prakash has hired labor to spray expensive weedicide across his 5 acres this afternoon.',
    exampleAction: 'He checks the Kissan Mithar Weather service for his village.',
    exampleAssistance: 'The service shows an 80% chance of sudden heavy rain at 4 PM and displays a red "Do Not Spray" alert.',
    exampleResult: 'Prakash postpones the spraying to the next morning. The rain washes the fields that evening. He saves ₹8,000 worth of chemicals from washing away.',
    
    provider: 'Premium Meteorological Data + Kissan Mithar Analytics',
    
    requirements: [
      'Location permission or manual village search'
    ],
    
    trustElements: [
      'Powered by highly accurate satellite and local meteorological data',
      'Specifically tuned for agricultural parameters (like wind speed for spraying)',
      'Real-time severe weather alerts'
    ],
    
    faqs: [
      { q: 'Is it more accurate than my phone\'s weather app?', a: 'Yes, it uses hyper-local agricultural data models rather than generic city-level forecasts.' },
      { q: 'What does "Activity Guidance" mean?', a: 'We analyze wind, rain, and heat to tell you if it\'s physically safe and effective to spray or irrigate.' },
      { q: 'Will I get alerts for storms?', a: 'Yes, severe weather warnings for your district are highlighted prominently.' }
    ],
    
    relatedServices: ['crop-planning', 'disease-help'],
    
    metaTitle: 'Agricultural Weather Forecast & Alerts | Kissan Mithar',
    metaDescription: 'Get hyper-local farming weather, rain forecasts, and activity guidance for spraying, irrigation, and harvesting.'
  },

  'farm-labour': {
    id: 'farm-labour',
    slug: 'farm-labour',
    title: 'Farm Labour',
    shortProposition: 'Find the right hands for your farm work, exactly when you need them.',
    explanation: 'Connect with skilled agricultural workers and labor groups in your area for sowing, weeding, harvesting, and daily farm operations.',
    primaryCTA: 'Find Farm Labour',
    secondaryCTA: 'Register as a Worker',
    heroImage: ASSETS.SERVICES.LABOUR,
    
    problemHeading: 'Labor shortages are the biggest bottleneck in modern farming.',
    problems: [
      'Inability to find workers during peak harvest season',
      'Delays in critical operations causing crop loss',
      'Difficulty finding workers with specific skills',
      'Unreliable verbal commitments'
    ],
    
    whatItIs: 'A local marketplace connecting farmers with agricultural laborers.',
    whatItDoes: 'Lets you search for, view profiles of, and contact available workers in your district.',
    whatIsRequired: 'Your location and the specific type of work you need done.',
    whatResult: 'Contact details of available, skilled farm workers ready to be hired.',
    
    workflowSteps: [
      'Enter your location and required dates',
      'Select the type of work (harvesting, weeding, driving, general)',
      'Browse profiles of available local workers or labor groups',
      'Review their experience and past ratings if available',
      'Contact them directly to negotiate and hire'
    ],
    
    outputs: [
      'Worker profiles and contact details',
      'Skill and experience tags',
      'Location-based discovery',
      'Availability status',
      'Labor group (Maistry) contacts for large jobs'
    ],
    
    targetAudience: [
      'Farmers facing labor shortages during peak seasons',
      'Commercial farms needing large temporary workforces',
      'Farmers seeking specialized skills',
      'Agricultural workers looking for consistent employment'
    ],
    
    timing: 'Plan at least a few days before peak farm-work periods (sowing, heavy weeding, harvesting).',
    
    benefits: [
      'Complete farm operations on time',
      'Prevent crop loss due to delayed harvesting',
      'Find workers with exactly the skills you need',
      'Expand your network of reliable labor beyond your village'
    ],
    
    exampleProblem: 'Anil\'s mango orchard is ready for harvest, but his regular labor group is busy at another farm.',
    exampleAction: 'He opens the Farm Labour service and searches for "Fruit Harvesting" in his mandal.',
    exampleAssistance: 'He finds a labor contractor profile with a team of 15 experienced fruit pickers available starting tomorrow.',
    exampleResult: 'Anil contacts the contractor, agrees on a rate, and his mangoes are safely harvested and shipped to market on time.',
    
    provider: 'Registered local labor providers and individual workers',
    
    requirements: [
      'Location of the farm',
      'Type of work required',
      'Expected duration of the job'
    ],
    
    trustElements: [
      'Workers and contractors are registered with valid mobile numbers',
      'Community feedback and ratings help ensure reliability',
      'Direct communication—we do not take a cut of the wages'
    ],
    
    faqs: [
      { q: 'Does Kissan Mithar charge a commission?', a: 'No, we just connect you. You negotiate and pay the workers directly.' },
      { q: 'Can I find large groups of workers?', a: 'Yes, labor contractors and group leaders are registered on the platform.' },
      { q: 'How do I know they are reliable?', a: 'Look for profiles with strong ratings and extensive experience listed.' },
      { q: 'Can workers register themselves?', a: 'Yes, there is a dedicated registration path for agricultural workers to find jobs.' }
    ],
    
    relatedServices: ['farm-machinery', 'crop-connect'],
    
    metaTitle: 'Hire Local Farm Labour & Workers | Kissan Mithar',
    metaDescription: 'Find and hire skilled agricultural laborers and labor groups in your area for harvesting, sowing, and daily farm work.'
  },

  'farm-machinery': {
    id: 'farm-machinery',
    slug: 'farm-machinery',
    title: 'Farm Machinery',
    shortProposition: 'Rent the equipment you need. Earn from the equipment you own.',
    explanation: 'Find tractors, harvesters, drones, and implements available for rent near you. Machinery owners can list their equipment to maximize their earnings.',
    primaryCTA: 'Find the Right Machine',
    secondaryCTA: 'List Your Machinery',
    heroImage: ASSETS.SERVICES.MACHINERY,
    
    problemHeading: 'Buying expensive machinery isn\'t always profitable.',
    problems: [
      'High capital cost of buying specialized equipment',
      'Machinery sitting idle for 90% of the year',
      'Difficulty finding a specific implement locally',
      'Delays in land preparation due to lack of tractor availability'
    ],
    
    whatItIs: 'A rental marketplace for agricultural machinery and implements.',
    whatItDoes: 'Connects farmers who need equipment with local owners willing to rent it out on an hourly or daily basis.',
    whatIsRequired: 'Your location and the type of machinery needed.',
    whatResult: 'Direct contact with local equipment owners for immediate booking.',
    
    workflowSteps: [
      'Search for the specific machine (Tractor, Harvester, Drone, etc.)',
      'Filter by your village or district radius',
      'View photos, specifications, and rental rates',
      'Check availability',
      'Call the owner directly to book'
    ],
    
    outputs: [
      'Tractor and implement listings',
      'Harvester availability',
      'Agricultural drone services',
      'Owner contact details',
      'Pricing estimates (hourly/acre-basis)'
    ],
    
    targetAudience: [
      'Small to medium farmers who cannot afford to buy heavy machinery',
      'Large farmers needing extra capacity during peak season',
      'Machinery owners looking to rent out idle equipment',
      'Farmers looking to try new tech like spraying drones'
    ],
    
    timing: 'Before land preparation, major sowing operations, heavy spraying, or harvesting.',
    
    benefits: [
      'Access modern farming technology without massive capital investment',
      'Complete farm work faster and more efficiently',
      'Machinery owners generate significant passive income',
      'Reduce delays caused by waiting for the one busy tractor in the village'
    ],
    
    exampleProblem: 'Mahesh needs a rotavator attachment to prepare his field quickly before the rains, but he only owns a basic cultivator.',
    exampleAction: 'He checks the Farm Machinery service for rotavators near him.',
    exampleAssistance: 'He finds a neighbor 5km away who owns a heavy-duty rotavator and is willing to rent it out with a driver for ₹1000/hour.',
    exampleResult: 'Mahesh\'s field is prepared perfectly in half a day, and the neighbor makes extra income from idle equipment.',
    
    provider: 'Registered local machinery owners and custom hiring centers',
    
    requirements: [
      'Location',
      'Specific implement or machine type needed'
    ],
    
    trustElements: [
      'Owners are registered with verified phone numbers',
      'Clear equipment specifications and photos',
      'Direct peer-to-peer negotiation for fair pricing'
    ],
    
    faqs: [
      { q: 'Do rentals include a driver?', a: 'Most tractor and harvester listings include an operator, but this is negotiated directly with the owner.' },
      { q: 'How is pricing calculated?', a: 'Owners usually charge per hour or per acre. Rates are visible on their profiles.' },
      { q: 'Can I list my own tractor?', a: 'Yes! Any farmer can list their equipment to earn extra income when they aren\'t using it.' },
      { q: 'Are drones available?', a: 'Yes, certified drone operators frequently list their spraying services here.' }
    ],
    
    relatedServices: ['farm-labour', 'crop-planning'],
    
    metaTitle: 'Rent Farm Machinery & Tractors | Kissan Mithar',
    metaDescription: 'Find tractors, harvesters, drones and agricultural implements for rent near you. Machinery owners can list equipment to earn.'
  },

  'crop-connect': {
    id: 'crop-connect',
    slug: 'crop-connect',
    title: 'Crop Connect',
    shortProposition: 'Connect directly with buyers and get better prices for your harvest.',
    explanation: 'Bypass the complex traditional supply chain. List your expected harvest and connect directly with traders, food processors, and agricultural companies looking for quality produce.',
    primaryCTA: 'Connect Your Crop',
    heroImage: ASSETS.SERVICES.CROP_CONNECT,
    
    problemHeading: 'Growing a great crop is only half the battle. Selling it is the hard part.',
    problems: [
      'Exploitation by multiple middlemen reducing farmer profits',
      'Lack of visibility into current market demand',
      'Inability to find bulk buyers for specialized crops',
      'Post-harvest losses while waiting for a buyer'
    ],
    
    whatItIs: 'A digital bridge between farmers and verified agricultural buyers.',
    whatItDoes: 'Allows you to list your crop details so interested buyers can contact you directly for procurement.',
    whatIsRequired: 'Crop type, variety, expected harvest date, and estimated quantity.',
    whatResult: 'Direct inquiries and offers from interested bulk buyers.',
    
    workflowSteps: [
      'Create a listing for your current or upcoming crop',
      'Add details: Variety, Acreage, Expected Quantity, Harvest Date',
      'Upload photos as the crop nears maturity',
      'Verified buyers browse listings and send inquiries',
      'Negotiate directly and finalize the sale'
    ],
    
    outputs: [
      'Digital crop listing visible to registered buyers',
      'Direct buyer inquiries and messaging',
      'Market linkage without middlemen',
      'Pre-harvest booking potential'
    ],
    
    targetAudience: [
      'Commercial farmers looking for bulk buyers',
      'Growers of high-value or specialized crops',
      'Farmers frustrated with local mandi prices',
      'Food processing companies and bulk traders seeking direct sourcing'
    ],
    
    timing: 'Create a listing 1-2 months before expected harvest to give buyers time to plan procurement.',
    
    benefits: [
      'Increase profit margins by removing middlemen',
      'Secure buyers before the crop is even harvested',
      'Access larger, more professional markets and companies',
      'Reduce post-harvest stress and storage costs'
    ],
    
    exampleProblem: 'Raju is growing 10 acres of export-quality bananas but local traders are offering him a very low rate.',
    exampleAction: 'He lists his crop on Crop Connect, noting the specific variety, quality, and harvest date 4 weeks away.',
    exampleAssistance: 'A fruit processing company from a neighboring city sees the listing and contacts him directly.',
    exampleResult: 'Raju signs a procurement agreement at a 20% higher premium than local rates, with transport arranged by the buyer.',
    
    provider: 'Kissan Mithar Market Linkage Platform',
    
    requirements: [
      'Accurate crop variety and expected yield',
      'Estimated harvest date',
      'Farm location for logistics planning',
      'Honest representation of crop quality'
    ],
    
    trustElements: [
      'Buyers are verified businesses and registered traders',
      'Farmers retain complete control over negotiation and final sale',
      'Kissan Mithar support team assists in facilitating connections'
    ],
    
    faqs: [
      { q: 'Does Kissan Mithar buy the crop?', a: 'No, we are a platform connecting you directly with independent buyers and companies.' },
      { q: 'When should I list my crop?', a: 'Ideally 30-45 days before harvest. Early visibility attracts better buyers.' },
      { q: 'Who organizes transport?', a: 'Logistics are negotiated directly between the farmer and the buyer during the deal.' },
      { q: 'Is there a fee to list my crop?', a: 'Basic listing is currently free for farmers.' }
    ],
    
    relatedServices: ['expert-consultancy', 'farm-labour'],
    
    metaTitle: 'Sell Crops Directly to Buyers - Crop Connect | Kissan Mithar',
    metaDescription: 'List your harvest and connect directly with verified agricultural buyers, traders, and food processors to get better prices.'
  },

  'ai-farming-assistant': {
    id: 'ai-farming-assistant',
    slug: 'ai-farming-assistant',
    title: 'AI Farming Assistant',
    shortProposition: 'Instant answers to all your farming questions, 24/7.',
    explanation: 'Meet your personal digital agronomist. Ask any question about crops, fertilizers, pests, or techniques in your own language, and get immediate, science-backed answers.',
    primaryCTA: 'Ask the AI Assistant',
    secondaryCTA: 'Try Voice Search',
    heroImage: ASSETS.SERVICES.AI_ASSISTANT,
    
    problemHeading: 'Farming questions don\'t wait for business hours.',
    problems: [
      'Need immediate advice while standing in the middle of the field',
      'Google searches returning generic or irrelevant international results',
      'Language barriers preventing access to modern farming knowledge',
      'Human experts aren\'t available at 6 AM or late at night'
    ],
    
    whatItIs: 'A highly intelligent, agriculture-trained AI chatbot.',
    whatItDoes: 'Understands your questions in natural language and provides immediate, context-aware farming advice.',
    whatIsRequired: 'Just type or speak your question.',
    whatResult: 'An instant, accurate, and easy-to-understand answer.',
    
    workflowSteps: [
      'Open the AI Assistant on your phone',
      'Type or use voice to ask your question in English, Telugu, or Hindi',
      'The AI instantly analyzes massive agricultural databases',
      'Read the clear, step-by-step answer provided',
      'Ask follow-up questions to dig deeper'
    ],
    
    outputs: [
      'Instant answers to agronomy questions',
      'Crop planning advice',
      'Fertilizer calculation explanations',
      'Pest control recommendations',
      'Multilingual conversational UI'
    ],
    
    targetAudience: [
      'Every farmer looking for quick information',
      'Young, tech-savvy farmers learning new techniques',
      'Farmers needing immediate advice during off-hours'
    ],
    
    timing: 'Anytime, anywhere. 24 hours a day, 7 days a week.',
    
    benefits: [
      'Never wait for an answer—get immediate guidance in the field',
      'Communicate naturally in your native language via voice',
      'Access the combined knowledge of thousands of agricultural manuals instantly',
      'Free up human experts for only the most complex problems'
    ],
    
    exampleProblem: 'At 5:30 AM, while preparing to fertilize, Siva forgets the exact ratio for mixing his specific foliar spray.',
    exampleAction: 'He opens the app, taps the microphone, and asks in Telugu: "How much Neem oil should I mix per liter of water for cotton?"',
    exampleAssistance: 'The AI instantly responds in Telugu with the exact measurement (e.g., 5ml per liter) and adds a tip about spraying during the cooler morning hours.',
    exampleResult: 'Siva mixes the spray perfectly on the spot without having to wait for a shop to open or a friend to wake up.',
    
    provider: 'Kissan Mithar Advanced Agri-AI Engine',
    
    requirements: [
      'A smartphone with an internet connection',
      'A clear question'
    ],
    
    trustElements: [
      'Trained specifically on verified Indian agricultural data and university guidelines',
      'If the AI doesn\'t know or the issue is critical, it will suggest connecting to a human expert',
      'Always polite, patient, and available'
    ],
    
    faqs: [
      { q: 'Does it really understand Telugu/Hindi?', a: 'Yes! You can speak naturally in your language, and it will understand and reply in the same language.' },
      { q: 'Is the advice accurate?', a: 'The AI is trained on verified agricultural science, but you should always use your best judgment. For critical diseases, use the Expert Consultancy.' },
      { q: 'Is this a real person?', a: 'No, it is an Artificial Intelligence designed specifically for agriculture.' },
      { q: 'How much does it cost?', a: 'Basic AI queries are completely free for all Kissan Mithar users.' }
    ],
    
    relatedServices: ['expert-consultancy', 'disease-help'],
    
    metaTitle: 'AI Farming Assistant & Chatbot | Kissan Mithar',
    metaDescription: 'Ask any farming question in English, Telugu, or Hindi and get instant, science-backed answers from our advanced AI agronomist.'
  }
};
