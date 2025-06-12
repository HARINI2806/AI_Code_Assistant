import json

def export_bank_data(bank, path="bank_data.json"):
    data = {}
    for owner, acc in bank.accounts.items():
        data[owner] = {
            "balance": acc.get_balance(),
            "transactions": acc.get_statement()
        }
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
