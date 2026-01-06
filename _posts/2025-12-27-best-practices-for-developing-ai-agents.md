---
layout: post
title: "🤖 Best Practices for Developing AI Agents"
date: 2025-12-27
categories: [DevOps, AI, LLMs, Machine Learning]
tags: [LLMs, AI agents, best practices, software engineering, machine learning]
description: "A comprehensive guide to best practices for developing robust, reliable AI agents with code examples and patterns."
keywords: [LLMs, AI agents, best practices, software engineering, machine learning]
---

Here's a comprehensive guide for developing robust, reliable AI agents:

## 1. Design & Architecture
### 1.1 Clear Agent Purpose
```python
# ✅ Good: Clear, single responsibility
class IncidentAnalysisAgent:
    """
    Agent responsible for:
    - Fetching incidents from API
    - Analyzing incident data
    - Extracting actionable insights
    - Providing recommendations
    """

    def __init__(self, api_client):
        self.api_client = api_client
        self.config = config
        self.logger = logging.getLogger(__name__)

    def analyze_incidents(self):
        """Analyze single incident"""
        pass
    
    def batch_analyze(self, incidents):
        """Analyze multiple incidents"""
        pass
```

### 1.2 Separation of Concerns
```python
# ✅ Good: Separate components
class IncidentAgent:
    def __init__(self, fetcher, parser, analyzer, recommender):
        self.fetcher = fetcher          # Fetch data  
        self.parser = parser            # Parse data
        self.analyzer = analyzer        # Analyze data
        self.writer = writer            # Write results
    
# ❌ Bad: Everything mixed together
class MonolithicAgent:
    def __init__(self, api_client):
        # Fetch, parse, analyze, and write all in one class
        pass
```

## 2. Error Handling & Resilience
### 2.1 Comprehensive Error Handling
```python
import logging
from typing import Optional, Dict, Any
from functools import wraps
import time

logger = logging.getLogger(__name__)

class AIAgent:
    def __init__(self, max_retries=3, timeout=30):
        self.max_retries = max_retries
        self.timeout = timeout
    
    def retry_with_backoff(func):
        ### Decorator for retrying with exponential backoff ###
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            for attempt in range(self.max_retries):
                try:
                    logger.info(f"Attempt {attempt + 1}/{self.max_retries}")
                    return func(self, *args, **kwargs)
                
                except Exception as e:
                    if attempt == self.max_retries - 1:
                        logger.error(f"All {self.max_retries} attempts failed: {e}")
                        raise
                    
                    wait_time = 2 ** attempt # Exponential backoff
                    logger.warning(f"Attempt {attempt + 1} failed. Retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
        return wrapper
    
    @retry_with_backoff
    def fetch_data(self, url):
        """Fetch data from a URL with retries and timeout"""
        response = requests.get(url, timeout=self.timeout)
        response.raise_for_status()
        return response.json()
```

### 2.2 Graceful Degradation
```python
# ✅ Good: Provide fallback when API fails
class RobustIncidentAgent:
    def get_incidents(self):
        try:
            return self.fetch_from_primary_api()
        except Exception as e:
            logger.warning(f"Primary API failed: {e}. Falling back to secondary API.")
            return self.fetch_from_cache()      # Fallback to cached data
    
    def analyze_with_fallback(self, incident):
        try:
            return self.advanced_analysis(incident)
        except Exception as e:
            logger.warning(f"Advanced analysis failed: {e}. Using basic analysis.")
            return self.basic_analysis(incident) # Fallback to basic analysis
```

## 3. Input Validation & Simulation
### 3.1 Strict Input Validation
```python
from pydantic import BaseModel, ValidationError, Field
from typing import Optional

class IncidentData(BaseModel):
    ### Validate incident data structure ###
    incident_id: str
    target_name: str
    severity: str
    timestamp: Optional[str] = None

    @validator('incident_id')
    def incident_id_not_empty(cls, v):
        if not v and len(v) == 0:
            raise ValueError('incident_id must not be empty')
        return v
    
    @validator('severity')
    def severity_valid(cls, v):
        valid_severities = {'low', 'medium', 'high', 'critical'}
        if v not in valid_severities:
            raise ValueError(f'severity must be one of {valid_severities}')
        return v
    
class IncidentAgent:
    def process_incident(self, data: dict) -> bool:
        try:
            # Validate data structure
            incident = IncidentData(**data)
            logger.info(f"Processing incident: {incident.incident_id}")
            return True
        except ValidationError as e:
            logger.error(f"Invalid incident data: {e}")
            return False
```

### 3.2 Sanitize External Inputs
```python
import html
import re
from urllib.parse import quote

def sanitize_input(user_input: str) -> str:
    """Sanitize user input to prevent injection attacks"""
    # Remove potentially dangerous characters
    sanitized = html.escape(user_input)
    sanitized = re.sub(r'[<>\"\'%;()&+]', '', sanitized)
    sanitized = sanitized.strip()
    return sanitized

def sanitize_file_path(file_path: str) -> str:
    ### Prevent directory traversal attacks ###
    path = file_path.replace("..", "")
    path = path.replace("//", "/")
    return path
```

## 4. Logging & Monitoring
### 4.1 Comprehensive Logging
```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    ### Structured logging for AI agents ###

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.setup_handlers()

    def setup_handlers(self):
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)

        # File handler
        file_handler = logging.FileHandler('agent.log')
        file_handler.setLevel(logging.DEBUG)

        # Formatter
        log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        console_handler.setFormatter(log_formatter)
        file_handler.setFormatter(log_formatter)

        self.logger.addHandler(console_handler)
    
    def log_action(self, action: str, details: dict):
        ### Log structured action data ###
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "details": details
        }
        self.logger.info(json.dumps(log_entry))

# Usage details
logger = StructuredLogger(__name_)
logger.log_action('fetch_incidents', {
    'status': 'success',
    'count': 10,
    'duration_ms': 1234
})
```

### 4.2 Monitoring & Metrics
```python
from prometheus_client import Counter, Histogram, Guage
import time

class MonitoredAgent:
    """ Agent with monitoring and metrics """

    def __init__(self):
        # Metrics
        self.request_count = Counter(
            'agent_requests_total',
            'Total requests',
            ['method', 'status']
        )

        self.request_duration = Histogram(
            'agent_request_duration_seconds',
            'Request duration',
            ['method']
        )

        self.active_requests = Guage(
            'agent_active_requests',
            'Active requests'
        )
    
    def fetch_data(self, url):
        ### Fetch with monitoring ###
        start_time = time.time()
        self.active_requests.inc()

        try:
            response = requests.get(url)
            response.raise_for_status()

            self.request_count.labels(
                method='fetch',
                status='success'
            ).inc()

            return response.json()
        
        except Exception as e:
            self.request_count.labels(
                method='fetch',
                status='raise'
            ).inc()
            raise
        
        finally:
            duration = time.time() - start_time
            self.request_duration.labels(method='fetch').observe(duration)
            self.active_requests.dec()
```

## 5. Testing & Quality Assurance
### 5.1 Unit Testing
```python
import pytest
from unittest.mock import Mock, patch

class TestIncidentAgent:
    @pytest.fixture
    def agent(self):
        ### Create test agent ###
        mock_api = Mock()
        return IncidentAgent(api=mock_api)
    
    def test_extract_target_name(self, agent):
        ### Test target name extraction ###
        description = "Target Name: xyz.example.com"
        result = agent.extract_target_name(description)
        assert result == "xyz.example.com"
    
    def test_invalid_incident_data(self, agent):
        ### Test invalid incident data handling ###
        invalid_data = {'incident_id': ''} # Empty ID
        with pytest.raises(ValueError):
            agent.process_incident(invalid_data)
    
    @patch('requests.get')
    def test_fetch_with_proxy(self, mock_get, agent):
        ### Test fetch with proxy ###
        mock_get.return_value.json.return_value = {'result': []}

        result = agent.fetch_incidents()

        assert mock_get.called
        mock_get.assert_called_with(
            timeout=30,
            proxies={'http': 'http://proxy:8080'}
        )
```
### 5.2 Integration Testing
```python
import pytest
import responses

class TestAgentIntegration:
    @responses.activate
    def test_full_incidents_processing(self):
        ### Test complete incidents processing flow ###
        
        # Mock API response
        responses.add(
            responses.GET,
            'https://api.example.com/incidents',
            json=[{
                'id': 'INC123',
                'description': 'Target Name: xyz.example.com\nTarget Type: server',
            }]
            status=200
        )

        # Create agent and process
        agent = IncidentAgent()
        incidents = agent.fetch_incidents()

        # Assertions
        assert len(incidents) == 1
        assert inciedents[0]['incident_id'] == 'INC123'
        assert incidents[0]['target_name'] == 'xyz.example.com'
```

## 6. Configuration Management
### 6.1 Environment-Based Configuration
```python
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()  # Load .env file

@dataclass
class Config:
    """ Agent configuration """

    # API settings
    api_url: str = os.getenv('API_URL', 'https://api.example.com')
    api_timeout: int = int(os.getenv('API_TIMEOUT', '30'))
    max_retries: int = int(os.getenv('MAX_RETRIES', '3'))

    # Proxy settings
    proxy_enabled: bool = os.getenv('PROXY_ENABLED', 'false').lower() == 'true'
    proxy_url: str = os.getenv('PROXY_URL', 'https://proxy:8080')

    # Logging
    log_level: str = os.getenv('LOG_LEVEL', 'INFO')
    log_file: str = os.getenv('LOG_FILE', 'agent.log')

    # Security
    api_token: str = os.getenv('API_TOKEN', '')
    verify_ssl: bool = os.getenv('VERIFY_SSL', 'true').lower() == 'true'

    def validate(self):
        """ validate configuration """
        if not self.api_url:
            raise ValueError("API_URL must be set")
        if not self.api_token:
            raise ValueError("API_TOKEN must be set")
# Usage
config = Config()
config.validate()
```

### 6.2 .env file
```python
# API Configuration
API_URL=https://api.example.com
API_TIMEOUT=30
MAX_RETRIES=3

# Proxy Configuration
PROXY_ENABLED=true
PROXY_URL=http://proxy:8080

# Logging
LOG_LEVEL=DEBUG
LOG_FILE=agent.log

# Security
API_TOKEN=your_api_token_here
VERIFY_SSL=true
```

## 7. Security Best Practices
### 7.1 Secure Credential Management
```python
from cryptography.fernet import Fernet
import os

class SecureCredentials:
    """ Manage credentials securely """

    def __init__(self):
        # Never hardcode key - use environment variable
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY must be set in environment variables")
        
        self.cipher = Fernet(key)
    
    def encrypt(self, token: str) -> str:
        """ Encrypt sensitive token """
        return self.cipher.encrypt(token.encode()).decode()
    
    def decrypt(self, encrypted_token: str) -> str:
        """ Decrypt sensitive token """
        return self.cipher.decrypt(encrypted_token.encode()).decode()

# ❌ BAD: Hardcoding credentials
api_token = "secret_token_123"

# ✅ GOOD: Using secure credential management
api_token = os.getenv('API_TOKEN_ENCRYPTED')
```

### 7.2 Rate Limiting
```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import time

class RateLimitedAgent:
    """ Agent with rate limiting """

    def __init__(self, requests_per_second=1):
        self.requests_per_second = requests_per_second
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0
    
    def _wait_if_needed(self):
        """ Wait to maintain rate limit """
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
    
    def fetch(self, url):
        """ Fetch with rate limiting """
        self._wait_if_needed()
        self.last_request_time = time.time()
        return requests.get(url)
```

## 8. Performance Optimization
### 8.1 Caching
```python
from funtools import lru_cache
from datetime import datetime, timedelta

class CachedAgent:
    """ Agent with intelligent caching """

    def __init__(self):
        self.cache = {}
        self.cache_ttl = 300 # 5 minutes
    
    def get_incidents(self, force_refresh=False):
        """ Get incidents with caching """

        cache_key = 'incidents'

        # Check cache
        if cache_key in self.cache and not force_refresh:
            cached_data, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < timedelta(seconds=self.cache_ttl):
                return cached_data
        
        # Fetch fresh data
        logger.info("Fetching fresh incidents")
        incidents = self._fetch_from_api()

        # Update cache
        self.cache[cache_key] = (incidents, datetime.now())

        return incidents
    
    def _fetch_from_api(self):
        """ Fetch from API """
        pass
```

### 8.2 Batch Processing
```python
from typing import List, Iterator

class BatchedAgent:
    """ Process incidents in batches """

    def process_in_batches(self, incidents: List[dict], batch_size: int = 10) -> Iterator[List[dict]]:
        """ process incidents in batches to reduce memory """
        for i in range(0, len(incidents), batch_size):
            batch = incidents[i:i + batch_size]
            logger.info(f"Processing batch {i // batch_size + 1}")
           
            for incident in batch:
                yield self.process_incident(incident)
```

## 9. Documentation & Code Quality
### 9.1 Type Hints
```python
from typing import List, Dict, Optional, Tuple

class DocumentedAgent:
    """ Well-documented agent """

    def extract_target_name(self, description: str) -> Optional[str]:
        """ Extract target name from incident description

        Args:
            description (str): Incident description text

        Returns:
            The Target name if found, None Otherwise

        Raises:
            ValueError: If description is empty
        
        Example:
            >>> agent = DocumentedAgent()
            >>> agent.extract_target_name("Target Name: xyz.example.com")
            'xyz.example.com'
        """
        if not description:
            raise ValueError("Description must not be empty")
        
        match = re.search(r'Target Name:\s*(\S+)', description)
        return match.group(1) if match else None
    
    def batch_process(
        self,
        incidents: List[Dict[str, Any]],
        parallel: bool = False
    ) -> Tuple[List[Dict], List[str]]:
        """ 
        Process multiple incidents

        Args:
            incidents: List of incident dictionaries
            parallel: Whether to process in parallel

        Returns:
            Tuple of (processed_incidents, error_ids)
        """
        pass
```

## 10. Observability & Debugging
### 10.1 Debugging Mode
```python
import logging

class DebuggableAgent:
    """ Agent with debug mode """

    def __init__(self, debug=False):
        self.debug = debug
        self.setup_logging()
    
    def setup_logging(self):
        """ Setup logging based on debug mode """
        level = logging.DEBUG if self.debug else logging.INFO
        logging.basicConfig(level=level)
        self.logger = logging.getLogger(__name__)

    def fetch_data(self, url):
        """ Fetch with debug output """
        if self.debug:
            self.logger.debug(f"Fetching data from URL: {url}")
            self.logger.debug(f"Using proxies: {self.proxies}")
        
        response = requests.get(url)

        if self.debug:
            self.logger.debug(f"Response status: {response.status_code}")
            self.logger.debug(f"Response size: {len(response.content)} bytes")
        
        return response
```
### 10.2 Health Checks
```python
class HealthCheckAgent:
    """ Agent with health checks """

    def health_check(self) -> Dict[str, str]:
        """ check agent health """
        return {
            'api_connectivity': self._check_api(),
            'proxy_connectivity': self._check_proxy(),
            'database_connection': self._check_database(),
            'cache_health': self._check_cache()
        }
    
    def _check_api(self) -> str:
        """ Check API connectivity """
        try:
            response = requests.get(f"{self.api_url}/health", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
```

## ✅ Quick Refence Checklist
- ✅ Single responsibility principle
- ✅ Comprehensive error handling with retries
- ✅ Input validation and sanitization
- ✅ Structured logging
- ✅ Unit & Integration testing
- ✅ Configuration management
- ✅ Security best practices
- ✅ Rate limiting and Caching
- ✅ Type hints and documentation
- ✅ Health checks and monitoring
- ✅ Gradeful degradation
- ✅ Retry logic with backoff
- ✅ Environment-based configuration
- ✅ Secrets management
- ✅ Performance optimization

## 🚀 Complete Production-Ready Agent Template
```python
import logging
import os
import time
from dataclasses import dataclass
from typing import List, Dict, Optional
from functools import wraps

@dataclass
class Config:
    api_url: str = os.getenv('API_URL', 'https://api.example.com')
    api_timeout: int = int(os.getenv('API_TIMEOUT', '30'))
    max_retries: int = int(os.getenv('MAX_RETRIES', '3'))
    log_level: str = os.getenv('LOG_LEVEL', 'INFO')

class ProductionAgent:
    """ Production-ready AI Agent """

    def __init__(self, config: Config):
        self.config = config or Config()
        self.logger = self._setup_logging()
        self.cache = {}
    
    def _setup_logging(self):
        """ Setup structured logging """
        logger = logging.getLogger(__name__)
        logger.setLevel(self.config.log_level)

        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        handler.setFormatter(formatter)
        logger.addHandler(handler)
        return logger

    def retry(self, func):
        """ Retry decorator with backoff """
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(self.config.max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == self.config.max_retries - 1:
                        self.logger.error(f"All retries failed: {e}")
                        raise
                    wait_time = 2 ** attempt
                    self.logger.warning(f"Attempt {attempt + 1} failed. Retrying in {wait_time}s: {e}")
                    time.sleep(wait_time)
        return wrapper
    
    @retry
    def fetch_data(self, url: str) -> Dict:
        """ Fetch data with retry logic """
        self.logger.info(f"Fetching from: {url}")
        response = requests.get(url, timeout=self.config.api_timeout)
        response.raise_for_status()
        return response.json()
    
    def process(self, data: Dict) -> Optional[Dict]:
        """ Process data safely """
        try:
            self.logger.info("Processing data")
            # Your processing logic here
            return data
        except Exception as e:
            self.logger.error(f"Processing failed: {e}")
            return None

# Usage
if __name__ == "__main__":
    agent = ProductionAgent(config)
    data = agent.fetch_data(f"https://api.example.com/incidents")
    processed = agent.process(data)
```

This comprehensive guide covers all aspects of developing professional AI agents! 🎯