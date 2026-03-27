# Testing y TDD

Guía de Test-Driven Development, estrategia de testing por capas y objetivos de cobertura para el ecosistema AgentsMX.

## Filosofía: Red-Green-Refactor

```mermaid
graph LR
    RED[RED\nEscribir test\nque falla] --> GREEN[GREEN\nCódigo mínimo\nque pasa]
    GREEN --> REFACTOR[REFACTOR\nMejorar código\nsin romper tests]
    REFACTOR --> RED

    style RED fill:#f44336,color:white
    style GREEN fill:#4caf50,color:white
    style REFACTOR fill:#2196f3,color:white
```

### Ciclo TDD en Práctica

```python
# 1. RED: Escribir el test primero
def test_haversine_distance_known_points():
    """Distancia conocida: CDMX a Monterrey ~750 km."""
    cdmx = Coordinate(19.4326, -99.1332)
    mty = Coordinate(25.6866, -100.3161)

    distance = cdmx.distance_to(mty)

    assert 740_000 < distance < 760_000  # metros

# 2. GREEN: Implementar el código mínimo
@dataclass(frozen=True)
class Coordinate:
    latitude: float
    longitude: float

    def distance_to(self, other: "Coordinate") -> float:
        R = 6371000
        # ... implementación haversine
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

# 3. REFACTOR: Mejorar sin romper tests
# Agregar validación, optimizar, documentar
```

## Pirámide de Testing

```mermaid
graph TB
    subgraph Pirámide
        E2E["E2E Tests\n~10 tests\nLento, costoso"]
        INT["Integration Tests\n~50 tests\nDB real, HTTP"]
        UNIT["Unit Tests\n~200 tests\nRápido, aislado"]
    end

    E2E -.-> INT -.-> UNIT

    style UNIT fill:#4caf50,color:white
    style INT fill:#ff9800,color:white
    style E2E fill:#f44336,color:white
```

| Nivel | Cantidad | Velocidad | Cobertura | Dependencias |
|-------|----------|-----------|-----------|-------------|
| Unit | ~200 | < 1s cada uno | 80%+ | Mocks |
| Integration | ~50 | 1-5s cada uno | Flujos críticos | DB, HTTP |
| E2E | ~10 | 5-30s cada uno | Happy paths | Todo el stack |

## Objetivos de Cobertura

| Capa | Objetivo | Mínimo |
|------|----------|--------|
| Domain | 95% | 90% |
| Application (Use Cases) | 90% | 80% |
| Infrastructure (Adapters) | 70% | 60% |
| Interfaces (HTTP) | 80% | 70% |
| **Total** | **80%+** | **75%** |

## Testing por Capa Hexagonal

```mermaid
graph TB
    subgraph "Tests de Dominio (Unit)"
        T1[Entity tests]
        T2[Value Object tests]
        T3[Domain Service tests]
    end

    subgraph "Tests de Application (Unit)"
        T4[Use Case tests\ncon mocks de puertos]
    end

    subgraph "Tests de Infrastructure (Integration)"
        T5[Repository tests\ncon DB real]
        T6[External adapter tests\ncon API mock]
    end

    subgraph "Tests de Interface (Integration)"
        T7[HTTP endpoint tests\nFlask/FastAPI test client]
    end

    subgraph "E2E"
        T8[Flujos completos\ncon todo el stack]
    end
```

### Tests de Dominio (Unit)

```python
# tests/unit/domain/test_vehicle.py
import pytest
from domain.entities.vehicle import Vehicle
from domain.value_objects.coordinate import Coordinate

class TestVehicle:
    def test_update_position_first_time_always_stores(self):
        vehicle = Vehicle(id="v1", imei="123", plate="ABC123",
                         make="VW", model="Jetta", year=2020)
        coord = Coordinate(25.6866, -100.3161)

        result = vehicle.update_position(coord, ignition=True)

        assert result is True
        assert vehicle.current_position == coord
        assert vehicle.ignition is True

    def test_update_position_no_significant_change_skips(self):
        vehicle = Vehicle(id="v1", imei="123", plate="ABC123",
                         make="VW", model="Jetta", year=2020,
                         current_position=Coordinate(25.6866, -100.3161),
                         ignition=True)
        # Movimiento de solo 10 metros
        nearby = Coordinate(25.6867, -100.3161)

        result = vehicle.update_position(nearby, ignition=True)

        assert result is False

    def test_update_position_ignition_change_stores(self):
        vehicle = Vehicle(id="v1", imei="123", plate="ABC123",
                         make="VW", model="Jetta", year=2020,
                         current_position=Coordinate(25.6866, -100.3161),
                         ignition=True)

        result = vehicle.update_position(
            Coordinate(25.6866, -100.3161), ignition=False
        )

        assert result is True
        assert vehicle.ignition is False
```

### Tests de Value Objects

```python
# tests/unit/domain/test_coordinate.py
class TestCoordinate:
    def test_valid_coordinate(self):
        coord = Coordinate(25.6866, -100.3161)
        assert coord.latitude == 25.6866

    def test_invalid_latitude_raises(self):
        with pytest.raises(ValueError, match="Latitud inválida"):
            Coordinate(91.0, -100.0)

    def test_distance_to_same_point_is_zero(self):
        coord = Coordinate(25.6866, -100.3161)
        assert coord.distance_to(coord) == pytest.approx(0, abs=1)

    def test_distance_known_cities(self):
        cdmx = Coordinate(19.4326, -99.1332)
        mty = Coordinate(25.6866, -100.3161)
        assert cdmx.distance_to(mty) == pytest.approx(750_000, rel=0.02)
```

### Tests de Use Cases

```python
# tests/unit/application/test_sync_gps.py
from unittest.mock import Mock, MagicMock
from application.use_cases.sync_gps import SyncGPSUseCase

class TestSyncGPSUseCase:
    def setup_method(self):
        self.gps_provider = Mock()
        self.vehicle_repo = Mock()
        self.compressor = Mock()
        self.use_case = SyncGPSUseCase(
            gps_provider=self.gps_provider,
            vehicle_repo=self.vehicle_repo,
            compressor=self.compressor
        )

    def test_stores_positions_with_significant_change(self):
        position = Mock(imei="123")
        vehicle = Mock()
        self.gps_provider.get_positions.return_value = [position]
        self.vehicle_repo.find_by_imei.return_value = vehicle
        self.compressor.should_store.return_value = True

        result = self.use_case.execute()

        assert result.stored == 1
        assert result.skipped == 0
        self.vehicle_repo.save_position.assert_called_once()

    def test_skips_positions_without_change(self):
        position = Mock(imei="123")
        vehicle = Mock()
        self.gps_provider.get_positions.return_value = [position]
        self.vehicle_repo.find_by_imei.return_value = vehicle
        self.compressor.should_store.return_value = False

        result = self.use_case.execute()

        assert result.stored == 0
        assert result.skipped == 1
```

### Tests de Infraestructura (Integration)

```python
# tests/integration/test_postgres_repository.py
import pytest
from infrastructure.adapters.postgres_vehicle_repository import (
    PostgresVehicleRepository
)

@pytest.fixture
def db_session():
    """Fixture con base de datos de test."""
    engine = create_engine("postgresql://test:test@localhost:5432/test_db")
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

class TestPostgresVehicleRepository:
    def test_find_by_imei_existing(self, db_session):
        repo = PostgresVehicleRepository(db_session)
        # Insertar dato de prueba
        db_session.execute(text(
            "INSERT INTO vehicles (id, imei, plate) VALUES ('v1', '123', 'ABC')"
        ))

        vehicle = repo.find_by_imei("123")

        assert vehicle is not None
        assert vehicle.imei == "123"

    def test_find_by_imei_not_found(self, db_session):
        repo = PostgresVehicleRepository(db_session)

        vehicle = repo.find_by_imei("nonexistent")

        assert vehicle is None
```

## Estructura de Tests

```
tests/
├── conftest.py              # Fixtures compartidas
├── unit/
│   ├── domain/
│   │   ├── test_vehicle.py
│   │   ├── test_coordinate.py
│   │   └── test_state_compressor.py
│   └── application/
│       ├── test_sync_gps.py
│       └── test_route_optimizer.py
├── integration/
│   ├── test_postgres_repository.py
│   ├── test_seeworld_adapter.py
│   └── test_api_endpoints.py
└── e2e/
    └── test_gps_sync_flow.py
```

## Ejecución de Tests

```bash
# Todos los tests
pytest

# Solo unit tests
pytest tests/unit/

# Con cobertura
pytest --cov=src --cov-report=html --cov-fail-under=80

# Test específico
pytest tests/unit/domain/test_vehicle.py::TestVehicle::test_update_position

# Verbose con print
pytest -v -s tests/unit/

# Parallel (con pytest-xdist)
pytest -n auto
```

## Configuración pytest

```ini
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = [
    "--cov=src",
    "--cov-report=html:htmlcov",
    "--cov-report=term-missing",
    "--cov-fail-under=80",
    "-v"
]
markers = [
    "slow: marks tests as slow",
    "integration: marks integration tests",
    "e2e: marks end-to-end tests"
]
```
