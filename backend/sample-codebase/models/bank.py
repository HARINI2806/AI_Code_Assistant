from .account import Account

class Bank:
    def __init__(self):
        self.accounts = {}

    def create_account(self, owner):
        if owner in self.accounts:
            raise ValueError("Account already exists")
        self.accounts[owner] = Account(owner)

    def get_account(self, owner):
        return self.accounts.get(owner)

    def transfer(self, from_owner, to_owner, amount):
        from_acc = self.get_account(from_owner)
        to_acc = self.get_account(to_owner)
        if not from_acc or not to_acc:
            raise ValueError("Account not found")
        from_acc.withdraw(amount)
        to_acc.deposit(amount)
