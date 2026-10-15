import 'dart:convert';

class ChemicalPrescriptionItem {
  final String chemicalName;
  final String commercialBrand;
  final String dosage;
  final String applicationMethod;
  final int? waitingPeriodDays;

  ChemicalPrescriptionItem({
    required this.chemicalName,
    required this.commercialBrand,
    required this.dosage,
    required this.applicationMethod,
    this.waitingPeriodDays,
  });

  factory ChemicalPrescriptionItem.fromJson(Map<String, dynamic> json) {
    return ChemicalPrescriptionItem(
      chemicalName: json['chemicalName']?.toString() ?? '',
      commercialBrand: json['commercialBrand']?.toString() ?? '',
      dosage: json['dosage']?.toString() ?? '',
      applicationMethod: json['applicationMethod']?.toString() ?? '',
      waitingPeriodDays: json['waitingPeriodDays'] != null
          ? int.tryParse(json['waitingPeriodDays'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chemicalName': chemicalName,
      'commercialBrand': commercialBrand,
      'dosage': dosage,
      'applicationMethod': applicationMethod,
      if (waitingPeriodDays != null) 'waitingPeriodDays': waitingPeriodDays,
    };
  }
}

class DiseaseTreatmentPlanModel {
  final String id;
  final String diseaseRequestId;
  final String diseaseName;
  final String? causalOrganism;
  final String severity;
  final String diagnosisSummary;
  final String immediateAction;
  final List<ChemicalPrescriptionItem> chemicalTreatment;
  final String? organicTreatment;
  final String? preventativeMeasures;
  final int followUpDays;
  final double? estimatedCost;
  final String? pdfUrl;
  final DateTime? createdAt;

  DiseaseTreatmentPlanModel({
    required this.id,
    required this.diseaseRequestId,
    required this.diseaseName,
    this.causalOrganism,
    this.severity = 'MEDIUM',
    required this.diagnosisSummary,
    required this.immediateAction,
    this.chemicalTreatment = const [],
    this.organicTreatment,
    this.preventativeMeasures,
    this.followUpDays = 7,
    this.estimatedCost,
    this.pdfUrl,
    this.createdAt,
  });

  factory DiseaseTreatmentPlanModel.fromJson(Map<String, dynamic> json) {
    List<ChemicalPrescriptionItem> chems = [];
    final rawChem = json['chemicalTreatment'];
    if (rawChem is List) {
      chems = rawChem
          .map((c) => ChemicalPrescriptionItem.fromJson(c as Map<String, dynamic>))
          .toList();
    } else if (rawChem is String) {
      try {
        final decoded = jsonDecode(rawChem);
        if (decoded is List) {
          chems = decoded
              .map((c) => ChemicalPrescriptionItem.fromJson(c as Map<String, dynamic>))
              .toList();
        }
      } catch (_) {}
    }

    return DiseaseTreatmentPlanModel(
      id: json['id']?.toString() ?? '',
      diseaseRequestId: json['diseaseRequestId']?.toString() ?? '',
      diseaseName: json['diseaseName']?.toString() ?? '',
      causalOrganism: json['causalOrganism']?.toString(),
      severity: json['severity']?.toString() ?? 'MEDIUM',
      diagnosisSummary: json['diagnosisSummary']?.toString() ?? '',
      immediateAction: json['immediateAction']?.toString() ?? '',
      chemicalTreatment: chems,
      organicTreatment: json['organicTreatment']?.toString(),
      preventativeMeasures: json['preventativeMeasures']?.toString(),
      followUpDays: int.tryParse(json['followUpDays']?.toString() ?? '7') ?? 7,
      estimatedCost: json['estimatedCost'] != null
          ? (json['estimatedCost'] as num).toDouble()
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
      'diseaseRequestId': diseaseRequestId,
      'diseaseName': diseaseName,
      'causalOrganism': causalOrganism,
      'severity': severity,
      'diagnosisSummary': diagnosisSummary,
      'immediateAction': immediateAction,
      'chemicalTreatment': chemicalTreatment.map((c) => c.toJson()).toList(),
      'organicTreatment': organicTreatment,
      'preventativeMeasures': preventativeMeasures,
      'followUpDays': followUpDays,
      'estimatedCost': estimatedCost,
      'pdfUrl': pdfUrl,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}

class DiseaseRequestModel {
  final String id;
  final String farmerId;
  final String? expertId;
  final String status;
  final String? cropType;
  final String? cropAge;
  final String? affectedPart;
  final String? symptomDescription;
  final String? voiceNoteUrl;
  final String? voiceText;
  final List<String> photos;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String? spreadRate;
  final String? previousPesticides;
  final String? notes;
  final DateTime? submittedAt;
  final DiseaseTreatmentPlanModel? treatment;

  DiseaseRequestModel({
    required this.id,
    required this.farmerId,
    this.expertId,
    required this.status,
    this.cropType,
    this.cropAge,
    this.affectedPart,
    this.symptomDescription,
    this.voiceNoteUrl,
    this.voiceText,
    this.photos = const [],
    this.latitude,
    this.longitude,
    this.address,
    this.spreadRate,
    this.previousPesticides,
    this.notes,
    this.submittedAt,
    this.treatment,
  });

  factory DiseaseRequestModel.fromJson(Map<String, dynamic> json) {
    List<String> parsedPhotos = [];
    final rawPhotos = json['photos'];
    if (rawPhotos is List) {
      parsedPhotos = rawPhotos.map((e) => e.toString()).toList();
    } else if (rawPhotos is Map && rawPhotos['urls'] is List) {
      parsedPhotos = (rawPhotos['urls'] as List).map((e) => e.toString()).toList();
    }

    double? lat;
    double? lng;
    String? addr;
    final gps = json['gps'];
    if (gps is Map<String, dynamic>) {
      lat = (gps['latitude'] as num?)?.toDouble();
      lng = (gps['longitude'] as num?)?.toDouble();
      addr = gps['address']?.toString() ?? gps['village']?.toString();
    }

    return DiseaseRequestModel(
      id: json['id']?.toString() ?? '',
      farmerId: json['farmerId']?.toString() ?? '',
      expertId: json['expertId']?.toString(),
      status: json['status']?.toString() ?? 'SUBMITTED',
      cropType: json['cropType']?.toString(),
      cropAge: json['cropAge']?.toString(),
      affectedPart: json['affectedPart']?.toString(),
      symptomDescription: json['symptomDescription']?.toString(),
      voiceNoteUrl: json['voiceNoteUrl']?.toString(),
      voiceText: json['voiceText']?.toString(),
      photos: parsedPhotos,
      latitude: lat,
      longitude: lng,
      address: addr,
      spreadRate: json['spreadRate']?.toString(),
      previousPesticides: json['previousPesticides']?.toString(),
      notes: json['notes']?.toString(),
      submittedAt: json['submittedAt'] != null
          ? DateTime.tryParse(json['submittedAt'].toString())
          : null,
      treatment: json['treatment'] != null
          ? DiseaseTreatmentPlanModel.fromJson(json['treatment'] as Map<String, dynamic>)
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
      'affectedPart': affectedPart,
      'symptomDescription': symptomDescription,
      'voiceNoteUrl': voiceNoteUrl,
      'voiceText': voiceText,
      'photos': photos,
      if (latitude != null && longitude != null)
        'gps': {
          'latitude': latitude,
          'longitude': longitude,
          'address': address,
        },
      'spreadRate': spreadRate,
      'previousPesticides': previousPesticides,
      'notes': notes,
      'submittedAt': submittedAt?.toIso8601String(),
      'treatment': treatment?.toJson(),
    };
  }
}
