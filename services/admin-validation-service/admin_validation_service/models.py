<<<<<<< HEAD
from django.db import models


class PropertyReview(models.Model):
    property_id = models.IntegerField(db_column="Property_Id", db_index=True)
    admin_user_id = models.IntegerField(db_column="Admin_User_Id", db_index=True)
    decision = models.CharField(max_length=20)
    note = models.CharField(max_length=1000, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_column="Created_At")

    class Meta:
        db_table = "Property_Reviews"
=======
"""Models intentionally removed to avoid database dependency."""
>>>>>>> 07acdb2b48ee3790e99efe1efa7a7a09024b125e
