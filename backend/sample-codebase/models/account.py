from .transaction import Transaction

class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.transactions = []

    def deposit(self, amount):
        self.balance += amount
        self.transactions.append(Transaction(amount, "deposit"))

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self.transactions.append(Transaction(amount, "withdrawal"))

    def get_balance(self):
        return self.balance

    def get_statement(self):
        return [t.to_dict() for t in self.transactions]
