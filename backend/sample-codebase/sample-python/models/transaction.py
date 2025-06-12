from datetime import datetime

class Transaction:
    def __init__(self, amount, transaction_type):
        self.amount = amount
        self.transaction_type = transaction_type
        self.timestamp = datetime.now()

    def to_dict(self):
        return {
            "amount": self.amount,
            "type": self.transaction_type,
            "timestamp": self.timestamp.isoformat()
        }
