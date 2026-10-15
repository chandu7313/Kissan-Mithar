import 'dart:convert';

class FertilizerPlanModel {
  final String id;
  final String fertilizerRequestId;
  final String diagnosis;
  final String summary;
  final List<FertilizerScheduleStage> schedule;
  final String? organicAlternatives;
  final String? soilTreatment;
  final String? precautions;
  final double? estimatedBudget;
  final String? pdfUrl;
  final DateTime? createdAt;

  FertilizerPlanModel({
    required this.id,
    required this.fertilizerRequestId,
    required this.diagnosis,
    required this.summary,
    required this.schedule,
    this.organicAlternatives,
    this.soilTreatment,
    this.precautions,
    this.estimatedBudget,
    this.pdfUrl,
    this.createdAt,
  });

  factory FertilizerPlanModel.fromJson(Map<String, dynamic> json) {
    var rawSchedule = json['schedule'];
    List<FertilizerScheduleStage> stages = [];
    if (rawSchedule is List) {
      stages = rawSchedule
          .map((item) => FertilizerScheduleStage.fromJson(item as Map<String, dynamic>))
          .toList();
    } else if (rawSchedule is String) {
      try {
        final decoded = jsonDecode(rawSchedule);
        if (decoded is List) {
          stages = decoded
              .map((item) => FertilizerScheduleStage.fromJson(item as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}
    }

    return FertilizerPlanModel(
      id: json['id']?.toString() ?? '',
      fertilizerRequestId: json['fertilizerRequestId']?.toString() ?? '',
      diagnosis: json['diagnosis']?.toString() ?? '',
      summary: json['summary']?.toString() ?? '',
      schedule: stages,
      organicAlternatives: json['organicAlternatives']?.toString(),
      soilTreatment: json['soilTreatment']?.toString(),
      precautions: json['precautions']?.toString(),
      estimatedBudget: json['estimatedBudget'] != null
          ? (json['estimatedBudget'] as num).toDouble()
          : null,
      pdfUrl: json['pdfUrl']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fertilizerRequestId': fertilizerRequestId,
      'diagnosis': diagnosis,
      'summary': summary,
      'schedule': schedule.map((s) => s.toJson()).toList(),
      'organicAlternatives': organicAlternatives,
      'soilTreatment': soilTreatment,
      'precautions': precautions,
      'estimatedBudget': estimatedBudget,
      'pdfUrl': pdfUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class FertilizerScheduleStage {
  final String stage;
  final String timing;
  final List<FertilizerItem> fertilizers;
  final String? notes;

  FertilizerScheduleStage({
    required this.stage,
    required this.timing,
    required this.fertilizers,
    this.notes,
  });

  factory FertilizerScheduleStage.fromJson(Map<String, dynamic> json) {
    var fertList = json['fertilizers'];
    List<FertilizerItem> items = [];
    if (fertList is List) {
      items = fertList
          .map((i) => FertilizerItem.fromJson(i as Map<String, dynamic>))
          .toList();
    }
    return FertilizerScheduleStage(
      stage: json['stage']?.toString() ?? '',
      timing: json['timing']?.toString() ?? '',
      fertilizers: items,
      notes: json['notes']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stage': stage,
      'timing': timing,
      'fertilizers': fertilizers.map((f) => f.toJson()).toList(),
      if (notes != null) 'notes': notes,
    };
  }
}

class FertilizerItem {
  final String name;
  final String dosage;
  final String method;

  FertilizerItem({
    required this.name,
    required this.dosage,
    required this.method,
  });

  factory FertilizerItem.fromJson(Map<String, dynamic> json) {
    return FertilizerItem(
      name: json['name']?.toString() ?? '',
      dosage: json['dosage']?.toString() ?? '',
      method: json['method']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'dosage': dosage,
      'method': method,
    };
  }
}

class FertilizerRequestModel {
  final String id;
  final String farmerId;
  final String? expertId;
  final String status;
  final String? cropType;
  final String? cropAge;
  final double landAcres;
  final String? soilType;
  final String? problemCategory;
  final String? issueDescription;
  final String? voiceNoteUrl;
  final String? voiceText;
  final List<String> photos;
  final double latitude;
  final double longitude;
  final String? address;
  final String? village;
  final String? district;
  final String? state;
  final String? previousFertilizers;
  final String? irrigationType;
  final String? notes;
  final DateTime? submittedAt;
  final FertilizerPlanModel? plan;

  FertilizerRequestModel({
    required this.id,
    required this.farmerId,
    this.expertId,
    required this.status,
    this.cropType,
    this.cropAge,
    this.landAcres = 1.0,
    this.soilType,
    this.problemCategory,
    this.issueDescription,
    this.voiceNoteUrl,
    this.voiceText,
    this.photos = const [],
    required this.latitude,
    required this.longitude,
    this.address,
    this.village,
    this.district,
    this.state,
    this.previousFertilizers,
    this.irrigationType,
    this.notes,
    this.submittedAt,
    this.plan,
  });

  factory FertilizerRequestModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedPhotos = [];
    final rawPhotos = json['photos'];
    if (rawPhotos is List) {
      parsedPhotos = rawPhotos.map((e) => e.toString()).toList();
    } else if (rawPhotos is Map && rawPhotos['urls'] is List) {
      parsedPhotos = (rawPhotos['urls'] as List).map((e) => e.toString()).toList();
    }

    double lat = 0.0;
    double lng = 0.0;
    String? addr;
    String? vil;
    String? dist;
    String? st;

    final gps = json['gps'];
    if (gps is Map<String, dynamic>) {
      lat = (gps['latitude'] as num?)?.toDouble() ?? 0.0;
      lng = (gps['longitude'] as num?)?.toDouble() ?? 0.0;
      addr = gps['address']?.toString();
      vil = gps['village']?.toString();
      dist = gps['district']?.toString();
      st = gps['state']?.toString();
    }

    return FertilizerRequestModel(
      id: json['id']?.toString() ?? '',
      farmerId: json['farmerId']?.toString() ?? '',
      expertId: json['expertId']?.toString(),
      status: json['status']?.toString() ?? 'SUBMITTED',
      cropType: json['cropType']?.toString(),
      cropAge: json['cropAge']?.toString(),
      landAcres: (json['landAcres'] as num?)?.toDouble() ?? 1.0,
      soilType: json['soilType']?.toString(),
      problemCategory: json['problemCategory']?.toString(),
      issueDescription: json['issueDescription']?.toString(),
      voiceNoteUrl: json['voiceNoteUrl']?.toString(),
      voiceText: json['voiceText']?.toString(),
      photos: parsedPhotos,
      latitude: lat,
      longitude: lng,
      address: addr,
      village: vil,
      district: dist,
      state: st,
      previousFertilizers: json['previousFertilizers']?.toString(),
      irrigationType: json['irrigationType']?.toString(),
      notes: json['notes']?.toString(),
      submittedAt: json['submittedAt'] != null
          ? DateTime.tryParse(json['submittedAt'].toString())
          : null,
      plan: json['plan'] != null
          ? FertilizerPlanModel.fromJson(json['plan'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'farmerId': farmerId,
      'expertId': expertId,
      'status': status,
      'cropType': cropType,
      'cropAge': cropAge,
      'landAcres': landAcres,
      'soilType': soilType,
      'problemCategory': problemCategory,
      'issueDescription': issueDescription,
      'voiceNoteUrl': voiceNoteUrl,
      'voiceText': voiceText,
      'photos': photos,
      'gps': {
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'village': village,
        'district': district,
        'state': state,
      },
      'previousFertilizers': previousFertilizers,
      'irrigationType': irrigationType,
      'notes': notes,
      'submittedAt': submittedAt?.toIso8601String(),
      'plan': plan?.toJson(),
    };
  }
}
