import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../domain/models/ai_state.dart';
import '../providers/ai_assistant_provider.dart';

class AIAssistantScreen extends ConsumerWidget {
  const AIAssistantScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final aiState = ref.watch(aiAssistantProvider);
    final isListening = aiState.state == AIAssistantState.listening;
    final isProcessing = aiState.state == AIAssistantState.processing;
    final isSpeaking = aiState.state == AIAssistantState.aiSpeaking;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Kissan Mithar AI', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () {
            ref.read(aiAssistantProvider.notifier).stopSpeaking();
            context.pop();
          },
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // AI Character and Status
            Expanded(
              flex: 2,
              child: _buildStatusArea(context, aiState.state, aiState.messages),
            ),
            
            // Visual Shortcuts (Only show when idle/ready to listen and no long conversation yet)
            if (aiState.state == AIAssistantState.readyToListen || aiState.state == AIAssistantState.idle)
              Expanded(
                flex: 3,
                child: _buildShortcutsGrid(),
              ),

            // Voice Control Area
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(32), topRight: Radius.circular(32)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 20, offset: const Offset(0, -5)),
                ],
              ),
              child: Column(
                children: [
                  _buildStateIndicator(aiState.state),
                  const SizedBox(height: 24),
                  
                  // Main Interaction Button
                  GestureDetector(
                    onTap: () {
                      final notifier = ref.read(aiAssistantProvider.notifier);
                      if (isListening) {
                        notifier.stopListening(); // normally would wait for silence, but allow manual stop
                      } else if (isSpeaking) {
                        notifier.stopSpeaking();
                      } else {
                        notifier.startListening();
                      }
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: isListening ? Colors.redAccent : AppColors.secondary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: (isListening ? Colors.redAccent : AppColors.secondary).withOpacity(0.4),
                            blurRadius: isListening ? 30 : 15,
                            spreadRadius: isListening ? 10 : 2,
                          ),
                        ],
                      ),
                      child: Icon(
                        isListening ? Icons.stop_rounded : Icons.mic_rounded,
                        color: Colors.white,
                        size: 50,
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Latest Transcript
                  if (aiState.messages.isNotEmpty)
                    Text(
                      aiState.messages.last.isUser 
                          ? '"${aiState.messages.last.text}"' 
                          : aiState.messages.last.text,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: aiState.messages.last.isUser ? AppColors.textSecondary : AppColors.textPrimary,
                        fontWeight: aiState.messages.last.isUser ? FontWeight.normal : FontWeight.w600,
                        fontStyle: aiState.messages.last.isUser ? FontStyle.italic : FontStyle.normal,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusArea(BuildContext context, AIAssistantState state, List messages) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: state == AIAssistantState.aiSpeaking 
                ? const Color(0xFFE3F2FD) 
                : Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: state == AIAssistantState.aiSpeaking ? const Color(0xFFBBDEFB) : Colors.grey.shade200, width: 3),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(15),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: ClipOval(
            child: Image.asset(
              'assets/images/ai-bot.png',
              width: 100,
              height: 100,
              fit: BoxFit.cover,
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          _getStatusText(state),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        ),
      ],
    );
  }

  String _getStatusText(AIAssistantState state) {
    switch (state) {
      case AIAssistantState.aiSpeaking: return "🔊 AI is speaking...";
      case AIAssistantState.listening: return "🎙 Listening...";
      case AIAssistantState.processing: return "⏳ Please wait...";
      case AIAssistantState.error: return "🔄 Please try again";
      default: return "How can I help with your farm?";
    }
  }

  Widget _buildStateIndicator(AIAssistantState state) {
    String label = "TAP TO SPEAK";
    Color color = AppColors.textSecondary;
    
    if (state == AIAssistantState.listening) {
      label = "TAP TO STOP";
      color = Colors.redAccent;
    } else if (state == AIAssistantState.aiSpeaking) {
      label = "TAP TO STOP SPEAKING";
      color = AppColors.secondary;
    } else if (state == AIAssistantState.processing) {
      label = "PROCESSING...";
      color = Colors.orange;
    }

    return Text(
      label,
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w900,
        letterSpacing: 1.2,
        color: color,
      ),
    );
  }

  Widget _buildShortcutsGrid() {
    final shortcuts = [
      {'icon': Icons.grass, 'label': 'Crop', 'color': AppColors.primaryGreen},
      {'icon': Icons.science, 'label': 'Fertilizer', 'color': Colors.blue},
      {'icon': Icons.bug_report, 'label': 'Disease', 'color': Colors.redAccent},
      {'icon': Icons.wb_sunny, 'label': 'Weather', 'color': Colors.orange},
      {'icon': Icons.agriculture, 'label': 'Machinery', 'color': AppColors.tertiary},
      {'icon': Icons.people, 'label': 'Labour', 'color': Colors.teal},
      {'icon': Icons.storefront, 'label': 'Buy / Sell', 'color': AppColors.accentSunGold},
      {'icon': Icons.support_agent, 'label': 'Expert', 'color': Colors.indigo},
    ];

    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.8,
        crossAxisSpacing: 12,
        mainAxisSpacing: 20,
      ),
      itemCount: shortcuts.length,
      itemBuilder: (context, index) {
        final item = shortcuts[index];
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: (item['color'] as Color).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 28),
            ),
            const SizedBox(height: 8),
            Text(
              item['label'] as String,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
              maxLines: 1,
            ),
          ],
        );
      },
    );
  }
}
