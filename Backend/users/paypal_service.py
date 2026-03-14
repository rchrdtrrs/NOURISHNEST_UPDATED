import os
import httpx


PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'sandbox')
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', '')
PAYPAL_WEBHOOK_ID = os.environ.get('PAYPAL_WEBHOOK_ID', '')

PAYPAL_BASE_URLS = {
    'sandbox': 'https://api-m.sandbox.paypal.com',
    'live': 'https://api-m.paypal.com',
}


def _base_url():
    return PAYPAL_BASE_URLS.get(PAYPAL_MODE, PAYPAL_BASE_URLS['sandbox'])


def get_access_token():
    """Obtain OAuth2 access token via client credentials."""
    url = f"{_base_url()}/v1/oauth2/token"
    response = httpx.post(
        url,
        data={'grant_type': 'client_credentials'},
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        headers={'Accept': 'application/json'},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()['access_token']


def get_subscription_details(subscription_id: str) -> dict:
    """Fetch subscription details from PayPal."""
    token = get_access_token()
    url = f"{_base_url()}/v1/billing/subscriptions/{subscription_id}"
    response = httpx.get(
        url,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def cancel_subscription(subscription_id: str, reason: str = 'User requested cancellation') -> None:
    """Cancel a PayPal subscription."""
    token = get_access_token()
    url = f"{_base_url()}/v1/billing/subscriptions/{subscription_id}/cancel"
    response = httpx.post(
        url,
        json={'reason': reason},
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        },
        timeout=15,
    )
    response.raise_for_status()


def verify_webhook_signature(headers: dict, body: bytes) -> bool:
    """Verify PayPal webhook signature."""
    token = get_access_token()
    url = f"{_base_url()}/v1/notifications/verify-webhook-signature"
    payload = {
        'auth_algo': headers.get('PAYPAL-AUTH-ALGO', ''),
        'cert_url': headers.get('PAYPAL-CERT-URL', ''),
        'transmission_id': headers.get('PAYPAL-TRANSMISSION-ID', ''),
        'transmission_sig': headers.get('PAYPAL-TRANSMISSION-SIG', ''),
        'transmission_time': headers.get('PAYPAL-TRANSMISSION-TIME', ''),
        'webhook_id': PAYPAL_WEBHOOK_ID,
        'webhook_event': body.decode('utf-8') if isinstance(body, bytes) else body,
    }
    response = httpx.post(
        url,
        json=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        },
        timeout=15,
    )
    if response.status_code != 200:
        return False
    return response.json().get('verification_status') == 'SUCCESS'
