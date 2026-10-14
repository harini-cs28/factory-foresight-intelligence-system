FFIS Synthetic Textile Manufacturing Dataset

This dataset is SYNTHETIC and was created for the FFIS textile-manufacturing prototype.

Files:
- textile_machine_sensor_data.csv: 3,120 time-series records for 12 machines.
  Contains temperature, vibration, current, RPM, pressure, load, operating hours,
  maintenance count, RUL and failure-horizon labels.
- machine_dependencies.csv: directed machine relationships for cascade analysis.
- factory_context.csv: criticality, production priority/impact, technician and spare
  part availability, repair estimates and maintenance-window context.

ML targets:
- Classification: failure_within_20_cycles
- Regression: rul_cycles

Important:
Do not present these measurements as real factory measurements. They are synthetic
prototype data designed to test the FFIS ML and decision-support pipeline.
