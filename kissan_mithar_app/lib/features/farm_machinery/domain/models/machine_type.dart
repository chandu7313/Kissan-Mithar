class MachineType {
  final String id;
  final String name;
  final String iconPath;
  final bool active;

  const MachineType({
    required this.id,
    required this.name,
    required this.iconPath,
    this.active = true,
  });
}
