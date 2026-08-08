import 'package:flutter/material.dart';

enum CommunicationMode {
  voiceCall('Voice Call', Icons.phone_rounded, '1-on-1 audio call with expert'),
  videoCall('Video Call', Icons.videocam_rounded, 'Live camera diagnosis on farm'),
  chat('Chat Advisory', Icons.chat_bubble_rounded, 'Ask doubts and get prescription');

  final String label;
  final IconData icon;
  final String subtitle;

  const CommunicationMode(this.label, this.icon, this.subtitle);
}

enum ConsultationStatus {
  upcoming('Upcoming', Color(0xFF1B6327), Color(0xFFE8F5E9)),
  completed('Completed', Color(0xFF2E7D32), Color(0xFFE8F8EA)),
  inProgress('In Progress', Color(0xFFE65100), Color(0xFFFFF3E0)),
  cancelled('Cancelled', Color(0xFFC62828), Color(0xFFFFEBEE));

  final String label;
  final Color textColor;
  final Color backgroundColor;

  const ConsultationStatus(this.label, this.textColor, this.backgroundColor);
}

class IssueCategory {
  final String id;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accentColor;

  const IssueCategory({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
  });
}

class PrescriptionItem {
  final String title;
  final String dosage;
  final String frequency;
  final String notes;

  const PrescriptionItem({
    required this.title,
    required this.dosage,
    required this.frequency,
    required this.notes,
  });

  Map<String, dynamic> toJson() => {
        'title': title,
        'dosage': dosage,
        'frequency': frequency,
        'notes': notes,
      };

  factory PrescriptionItem.fromJson(Map<String, dynamic> json) =>
      PrescriptionItem(
        title: json['title'] ?? '',
        dosage: json['dosage'] ?? '',
        frequency: json['frequency'] ?? '',
        notes: json['notes'] ?? '',
      );
}

class ConsultationItem {
  final String id;
  final String expertName;
  final String expertRole;
  final String expertPhotoUrl;
  final double expertRating;
  final CommunicationMode mode;
  final String category;
  final String language;
  final String scheduledDate;
  final String scheduledTime;
  final ConsultationStatus status;
  final String? message;
  final String? expertNotes;
  final List<PrescriptionItem> prescriptions;
  final List<String> mediaUrls;
  final String? voiceNoteUrl;
  final bool reminderEnabled;
  final String? meetingLink;
  final String? contactPhone;

  const ConsultationItem({
    required this.id,
    required this.expertName,
    required this.expertRole,
    required this.expertPhotoUrl,
    this.expertRating = 4.9,
    required this.mode,
    required this.category,
    this.language = 'Telugu',
    required this.scheduledDate,
    required this.scheduledTime,
    required this.status,
    this.message,
    this.expertNotes,
    this.prescriptions = const [],
    this.mediaUrls = const [],
    this.voiceNoteUrl,
    this.reminderEnabled = true,
    this.meetingLink,
    this.contactPhone,
  });

  ConsultationItem copyWith({
    String? id,
    String? expertName,
    String? expertRole,
    String? expertPhotoUrl,
    double? expertRating,
    CommunicationMode? mode,
    String? category,
    String? language,
    String? scheduledDate,
    String? scheduledTime,
    ConsultationStatus? status,
    String? message,
    String? expertNotes,
    List<PrescriptionItem>? prescriptions,
    List<String>? mediaUrls,
    String? voiceNoteUrl,
    bool? reminderEnabled,
    String? meetingLink,
    String? contactPhone,
  }) {
    return ConsultationItem(
      id: id ?? this.id,
      expertName: expertName ?? this.expertName,
      expertRole: expertRole ?? this.expertRole,
      expertPhotoUrl: expertPhotoUrl ?? this.expertPhotoUrl,
      expertRating: expertRating ?? this.expertRating,
      mode: mode ?? this.mode,
      category: category ?? this.category,
      language: language ?? this.language,
      scheduledDate: scheduledDate ?? this.scheduledDate,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      status: status ?? this.status,
      message: message ?? this.message,
      expertNotes: expertNotes ?? this.expertNotes,
      prescriptions: prescriptions ?? this.prescriptions,
      mediaUrls: mediaUrls ?? this.mediaUrls,
      voiceNoteUrl: voiceNoteUrl ?? this.voiceNoteUrl,
      reminderEnabled: reminderEnabled ?? this.reminderEnabled,
      meetingLink: meetingLink ?? this.meetingLink,
      contactPhone: contactPhone ?? this.contactPhone,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'expert_name': expertName,
        'expert_role': expertRole,
        'expert_photo_url': expertPhotoUrl,
        'expert_rating': expertRating,
        'mode': mode.name,
        'category': category,
        'language': language,
        'scheduled_date': scheduledDate,
        'scheduled_time': scheduledTime,
        'status': status.name,
        'message': message,
        'expert_notes': expertNotes,
        'prescriptions': prescriptions.map((p) => p.toJson()).toList(),
        'media_urls': mediaUrls,
        'voice_note_url': voiceNoteUrl,
        'reminder_enabled': reminderEnabled,
        'meeting_link': meetingLink,
        'contact_phone': contactPhone,
      };

  factory ConsultationItem.fromJson(Map<String, dynamic> json) {
    CommunicationMode parseMode(String? m) {
      if (m == 'videoCall') return CommunicationMode.videoCall;
      if (m == 'chat') return CommunicationMode.chat;
      return CommunicationMode.voiceCall;
    }

    ConsultationStatus parseStatus(String? s) {
      if (s == 'completed') return ConsultationStatus.completed;
      if (s == 'inProgress') return ConsultationStatus.inProgress;
      if (s == 'cancelled') return ConsultationStatus.cancelled;
      return ConsultationStatus.upcoming;
    }

    return ConsultationItem(
      id: json['id'] ?? 'CNS-${(1000 + DateTime.now().millisecond).toString()}',
      expertName: json['expert_name'] ?? 'Dr. Rajesh Deshmukh',
      expertRole: json['expert_role'] ?? 'Senior Agronomist',
      expertPhotoUrl: json['expert_photo_url'] ??
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      expertRating: (json['expert_rating'] as num?)?.toDouble() ?? 4.9,
      mode: parseMode(json['mode']),
      category: json['category'] ?? 'Pest & Disease',
      language: json['language'] ?? 'Telugu',
      scheduledDate: json['scheduled_date'] ?? 'Today',
      scheduledTime: json['scheduled_time'] ?? '4:00 PM',
      status: parseStatus(json['status']),
      message: json['message'],
      expertNotes: json['expert_notes'],
      prescriptions: (json['prescriptions'] as List<dynamic>?)
              ?.map((p) => PrescriptionItem.fromJson(p as Map<String, dynamic>))
              .toList() ??
          [],
      mediaUrls: List<String>.from(json['media_urls'] ?? []),
      voiceNoteUrl: json['voice_note_url'],
      reminderEnabled: json['reminder_enabled'] ?? true,
      meetingLink: json['meeting_link'],
      contactPhone: json['contact_phone'],
    );
  }
}

class ConsultationBookingDraft {
  final CommunicationMode mode;
  final String category;
  final String timeSlot;
  final String language;
  final String message;
  final List<String> mediaPaths;
  final String? voiceNotePath;
  final int voiceDurationSeconds;

  const ConsultationBookingDraft({
    this.mode = CommunicationMode.voiceCall,
    this.category = 'Pest & Disease',
    this.timeSlot = 'Today, 4:00 PM',
    this.language = 'Telugu',
    this.message = '',
    this.mediaPaths = const [],
    this.voiceNotePath,
    this.voiceDurationSeconds = 0,
  });

  ConsultationBookingDraft copyWith({
    CommunicationMode? mode,
    String? category,
    String? timeSlot,
    String? language,
    String? message,
    List<String>? mediaPaths,
    String? voiceNotePath,
    int? voiceDurationSeconds,
    bool clearVoice = false,
  }) {
    return ConsultationBookingDraft(
      mode: mode ?? this.mode,
      category: category ?? this.category,
      timeSlot: timeSlot ?? this.timeSlot,
      language: language ?? this.language,
      message: message ?? this.message,
      mediaPaths: mediaPaths ?? this.mediaPaths,
      voiceNotePath: clearVoice ? null : (voiceNotePath ?? this.voiceNotePath),
      voiceDurationSeconds:
          clearVoice ? 0 : (voiceDurationSeconds ?? this.voiceDurationSeconds),
    );
  }
}
