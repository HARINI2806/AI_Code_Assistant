from models.bank import Bank
from utils.exporter import export_bank_data

def sample_run():
    bank = Bank()
    bank.create_account("Alice")
    bank.create_account("Bob")
    bank.get_account("Alice").deposit(5000)
    bank.get_account("Bob").deposit(1000)
    bank.transfer("Alice", "Bob", 1000)
    export_bank_data(bank)
    return bank

if __name__ == "__main__":
    sample_run()
