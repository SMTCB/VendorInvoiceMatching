
import os
import subprocess
import json

def run_gen(output, scenario_data):
    cmd = [
        "python", "scripts/generate_test_pdf.py",
        "--output", f"testing/stress_test/{output}",
        "--json", json.dumps(scenario_data)
    ]
    print(f"Generating {scenario_data['filename']}...")
    subprocess.run(cmd, check=True)

def main():
    os.makedirs("testing/stress_test", exist_ok=True)
    
    # Read Scenarios
    with open("testing/stress_test/scenarios.json", "r") as f:
        scenarios = json.load(f)

    for s in scenarios:
        run_gen(s['filename'], s)

    print(f"\nAll {len(scenarios)} stress test invoices generated in testing/stress_test/")

if __name__ == "__main__":
    main()
