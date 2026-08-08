import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/core/localization/app_localizations.dart';
import 'package:kissan_mithar/features/home/presentation/screens/home_screen.dart';

void main() {
  testWidgets('HomeScreen renders greeting, weather card, 3 nav buttons & recent updates', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(
          localizationsDelegates: [
            AppLocalizations.delegate,
          ],
          home: HomeScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();

    // 1. Check Greeting & Farmer Name
    expect(find.byIcon(Icons.agriculture_rounded), findsOneWidget);
    expect(find.text('Ramesh Patel'), findsOneWidget);

    // 2. Check Weather Summary Card fetching from weatherProvider
    expect(find.text("TODAY'S FORECAST"), findsOneWidget);
    expect(find.text('26°C'), findsOneWidget);
    expect(find.text('Light Rain Expected'), findsOneWidget);

    // 3. Check Exactly 3 Large Navigation Buttons
    expect(find.text('Orchard Planning'), findsOneWidget);
    expect(find.text('Expert Consultation'), findsOneWidget);
    expect(find.text('Live Weather'), findsOneWidget);

    // 4. Check Recent Updates Section
    expect(find.text('Recent Updates'), findsOneWidget);
    expect(find.text('Your Orchard Plan is Ready! 🌳'), findsOneWidget);
  });
}
