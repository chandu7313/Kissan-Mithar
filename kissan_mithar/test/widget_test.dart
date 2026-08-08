import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/main.dart';

void main() {
  testWidgets('App smoke test - splash to language select', (WidgetTester tester) async {
    // Build our app
    await tester.pumpWidget(
      const ProviderScope(
        child: KissanMitharApp(),
      ),
    );
    await tester.pump();

    // Verify tagline on splash
    expect(find.text('Smart Farming, Simple Language.'), findsOneWidget);

    // Let the splash timer finish and transition to LanguageSelectScreen
    await tester.pump(const Duration(milliseconds: 2300));
    await tester.pumpAndSettle();

    // Verify Language selection screen rendered
    expect(find.text('Choose Your\nLanguage'), findsOneWidget);
    expect(find.text('Continue'), findsOneWidget);
  });
}
