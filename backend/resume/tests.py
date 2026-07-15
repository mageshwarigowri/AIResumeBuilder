import json
from django.test import TestCase
class GenerateResumeTests(TestCase):
    def test_health(self):
        self.assertEqual(self.client.get("/api/health/").status_code,200)
    def test_fallback_generation(self):
        response = self.client.post("/api/generate/",data=json.dumps({"fullName":"Avery Stone","email":"avery@example.com","targetRole":"Frontend Developer","skills":"React, JavaScript","experience":[],"education":[]}),content_type="application/json")
        self.assertEqual(response.status_code,200)
        self.assertIn("Frontend Developer",response.json()["resume"]["summary"])
    def test_validation(self):
        self.assertEqual(self.client.post("/api/generate/",data="{}",content_type="application/json").status_code,400)
