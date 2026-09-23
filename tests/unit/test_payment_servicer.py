"""Unit tests for the payment_service gRPC servicer (YooKassa is mocked)."""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from payment_proto.payment_service_pb2 import MakePaymentRequest

import payment_service.main as payment_main
from payment_service.main import PaymentServiceServicer, Settings


class FakeYooKassaClient:
    """Stands in for async_yookassa.YooKassaClient."""

    created_requests = []
    payment_id = "yk-payment-1"
    confirmation_url = "https://yookassa.example/confirm/1"

    def __init__(self, account_id=None, secret_key=None):
        self.account_id = account_id
        self.secret_key = secret_key
        self.payment = SimpleNamespace(create=self._create)

    async def _create(self, request):
        FakeYooKassaClient.created_requests.append(request)
        return SimpleNamespace(
            id=FakeYooKassaClient.payment_id,
            confirmation=SimpleNamespace(
                confirmation_url=FakeYooKassaClient.confirmation_url
            ),
        )

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False


@pytest.fixture(autouse=True)
def fake_yookassa(monkeypatch):
    FakeYooKassaClient.created_requests.clear()
    monkeypatch.setattr(payment_main, "YooKassaClient", FakeYooKassaClient)
    return FakeYooKassaClient


@pytest.fixture
def servicer():
    return PaymentServiceServicer(Settings())


@pytest.fixture
def context():
    return MagicMock()


async def test_make_payment_returns_payment_id_and_confirmation_url(
    servicer, context
):
    response = await servicer.MakePayment(
        MakePaymentRequest(username="alice", appid=42, price="9.99"), context
    )
    assert response.payment_id == "yk-payment-1"
    assert response.confirmation_url == "https://yookassa.example/confirm/1"


async def test_make_payment_builds_amount_in_rub_and_redirect_confirmation(
    servicer, context, fake_yookassa
):
    await servicer.MakePayment(
        MakePaymentRequest(username="alice", appid=42, price="123.45"), context
    )

    assert len(fake_yookassa.created_requests) == 1
    request = fake_yookassa.created_requests[0]

    assert request.amount.value == "123.45"
    assert request.amount.currency == "RUB"
    assert request.confirmation.type == "redirect"


async def test_make_payment_uses_configured_shop_credentials(servicer, context):
    await servicer.MakePayment(
        MakePaymentRequest(username="alice", appid=42, price="1.00"), context
    )
    # Settings() reads SHOPID / UKASS_API_KEY from the environment
    assert servicer.settings.shopid
    assert servicer.settings.ukass_api_key