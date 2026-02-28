import os
import subprocess
import sys

def run_remote_command(command):
    host = os.environ.get("VPS_HOST", "163.245.213.254")
    user = os.environ.get("VPS_USER", "root")
    password = os.environ.get("VPS_PASS", "new_root_pass_2026")

    ssh_cmd = [
        "sshpass", "-p", password,
        "ssh", "-o", "StrictHostKeyChecking=no", f"{user}@{host}", command
    ]

    result = subprocess.run(ssh_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error executing command: {result.stderr}", file=sys.stderr)
        return result.returncode, result.stdout, result.stderr
    return 0, result.stdout, result.stderr

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ssh_manager.py <command>")
        sys.exit(1)

    cmd = sys.argv[1]
    code, stdout, stderr = run_remote_command(cmd)
    if stdout:
        print(stdout, end="")
    if stderr:
        print(stderr, end="", file=sys.stderr)
    sys.exit(code)
