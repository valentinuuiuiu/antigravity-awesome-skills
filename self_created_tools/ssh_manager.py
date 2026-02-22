import paramiko
import sys
import os

HOST = "163.245.213.254"
USER = "root"
PASS = "new_root_pass_2026"

def execute_remote_command(command):
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, username=USER, password=PASS)

        stdin, stdout, stderr = client.exec_command(command)
        output = stdout.read().decode().strip()
        error = stderr.read().decode().strip()

        client.close()

        if output:
            print(f"[OUTPUT]\n{output}")
        if error:
            print(f"[ERROR]\n{error}")

    except Exception as e:
        print(f"Error executing command: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ssh_manager.py <command>")
        sys.exit(1)

    command = " ".join(sys.argv[1:])
    execute_remote_command(command)
