
需要使用最新的fastmcp 3 来写服务 

有几个要点:
1. 使用中间件或者装饰器来实现认证和日志记录(下面的例子中只是logger输出出来,但实际项目里需要询问用户是使用什么方式来记录)
2. 复用核心逻辑函数,同时支持普通http请求和mcp请求 

``` python
"""FastMCP + FastAPI 混合服务（JWT 认证版）

使用 Ed25519 JWT Token 进行用户身份验证。

环境变量：
    JWT_ED25519_PUBLIC_KEY: Base64 编码的 Ed25519 公钥

使用方法：
    export JWT_ED25519_PUBLIC_KEY="你的Base64公钥"
    uv run main.py
"""
import os
import time

from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastmcp import FastMCP
from fastmcp.server.auth.auth import TokenVerifier
from fastmcp.server.middleware import Middleware, MiddlewareContext
from fastmcp.server.dependencies import get_access_token
from fastmcp.dependencies import CurrentAccessToken
from fastmcp.server.auth import AccessToken
from loguru import logger

from jwt_verifier import (
    JWTTokenVerifier,
    TokenExpiredError,
    TokenFormatError,
    TokenInvalidError,
    VerifiedUser,
)

# ============================================================
# 配置
# ============================================================

PUBLIC_KEY = os.environ.get("JWT_ED25519_PUBLIC_KEY", "")

if not PUBLIC_KEY:
    raise RuntimeError("请设置 JWT_ED25519_PUBLIC_KEY 环境变量")

verifier = JWTTokenVerifier(PUBLIC_KEY)


# ============================================================
# 自定义 JWT 验证器（用于 FastMCP 认证）
# ============================================================
class JWTMCPVerifier(TokenVerifier):
    """
    JWT 验证器，适配 FastMCP 的 TokenVerifier 协议。
    
    接收 Bearer Token（JWT），验证签名后返回 AccessToken。
    """

    def __init__(self, jwt_verifier: JWTTokenVerifier, required_scopes: list[str] | None = None):
        super().__init__(required_scopes=required_scopes or ["tools"])
        self.jwt_verifier = jwt_verifier

    async def verify_token(self, token: str) -> AccessToken | None:
        """
        验证 JWT Token，返回 AccessToken 对象。
        
        Args:
            token: JWT Token 字符串
            
        Returns:
            AccessToken 对象（验证成功）或 None（验证失败）
        """
        try:
            user = self.jwt_verifier.verify_token(token)
            logger.info(f"✅ JWT 验证成功！用户: {user.name} ({user.email})")
            return AccessToken(
                token=token,
                client_id=user.email or user.user_id,
                scopes=self.required_scopes,
                expires_at=None,
                claims=user.claims,
            )
        except TokenExpiredError:
            logger.warning("❌ JWT Token 已过期")
            return None
        except TokenInvalidError:
            logger.warning("❌ JWT Token 签名无效")
            return None
        except TokenFormatError as e:
            logger.warning(f"❌ JWT Token 格式错误: {e}")
            return None


# ============================================================
# MCP 日志中间件（记录谁调用了什么工具、参数、耗时）
# ============================================================
class AuditLoggingMiddleware(Middleware):
    """
    MCP 审计日志中间件。

    拦截所有 tool 调用，记录：
      - 调用者身份（client_id / email）
      - 工具名称
      - 调用参数
      - 执行耗时
      - 执行结果（成功/失败）
    """

    async def on_call_tool(self, context: MiddlewareContext, call_next):
        tool_name = context.message.name
        arguments = context.message.arguments

        # 尝试获取调用者身份
        caller = "anonymous"
        try:
            token = get_access_token()
            if token:
                caller = token.client_id or "unknown"
        except Exception:
            pass

        logger.debug(
            "[MCP Audit] 🔧 tool={tool} | caller={caller} | args={args}",
            tool=tool_name,
            caller=caller,
            args=arguments,
        )

        start = time.perf_counter()
        try:
            result = await call_next(context)
            elapsed = (time.perf_counter() - start) * 1000
            logger.debug(
                "[MCP Audit] ✅ tool={tool} | caller={caller} | elapsed={elapsed:.1f}ms",
                tool=tool_name,
                caller=caller,
                elapsed=elapsed,
            )
            return result
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            logger.debug(
                "[MCP Audit] ❌ tool={tool} | caller={caller} | elapsed={elapsed:.1f}ms | error={error}",
                tool=tool_name,
                caller=caller,
                elapsed=elapsed,
                error=str(exc),
            )
            raise


# ============================================================
# 核心业务逻辑（复用）
# ============================================================
def core_add_logic(a: int, b: int) -> int:
    return a + b


# ============================================================
# 1. 初始化 FastMCP（带 JWT 认证）
# ============================================================
mcp_auth = JWTMCPVerifier(
    jwt_verifier=verifier,
    required_scopes=["tools"],
)

mcp = FastMCP("Demo 🚀", auth=mcp_auth)

# 注册 MCP 日志中间件
mcp.add_middleware(AuditLoggingMiddleware())


# ============================================================
# 2. 注册 MCP 工具（通过 CurrentAccessToken 获取用户信息）
# ============================================================
@mcp.tool()
async def add(
    a: int,
    b: int,
    token: AccessToken = CurrentAccessToken(),
) -> str:
    """Add two numbers (Available for LLM)

    两数相加，返回结果和调用者信息。
    """
    user_email = token.client_id
    result = core_add_logic(a, b)
    return f"{a} + {b} = {result} (called by {user_email})"


@mcp.tool()
async def whoami(
    token: AccessToken = CurrentAccessToken(),
) -> dict:
    """查看当前认证用户的信息"""
    logger.info(f"token: {token}")
    return {
        "email": token.client_id,
        "scopes": token.scopes,
        "claims": token.claims,
    }


# ============================================================
# 3. 初始化 FastAPI + 挂载 MCP
# ============================================================
mcp_app = mcp.http_app(path="/")

app = FastAPI(
    title="Hybrid API & MCP Server (JWT Auth)",
    lifespan=mcp_app.lifespan,
)

# 挂载 MCP 到 /mcp 路径
app.mount("/mcp", mcp_app)


# ============================================================
# FastAPI 日志中间件（记录 REST 接口调用）
# ============================================================
@app.middleware("http")
async def fastapi_audit_logging(request: Request, call_next):
    """
    FastAPI 审计日志中间件。

    记录：
      - 请求方法 + 路径 + 查询参数
      - 调用者身份（从 Authorization header 解析 JWT）
      - 响应状态码
      - 执行耗时
    """
    caller = "anonymous"
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token_str = auth_header[7:]
        try:
            user = verifier.verify_token(token_str)
            caller = user.email or user.user_id
        except Exception:
            caller = "invalid-token"

    method = request.method
    path = request.url.path
    query = str(request.query_params) if request.query_params else ""

    logger.debug(
        "[REST Audit] → {method} {path} | caller={caller} | query={query}",
        method=method,
        path=path,
        caller=caller,
        query=query,
    )

    start = time.perf_counter()
    response: Response = await call_next(request)
    elapsed = (time.perf_counter() - start) * 1000

    logger.debug(
        "[REST Audit] ← {method} {path} | caller={caller} | status={status} | elapsed={elapsed:.1f}ms",
        method=method,
        path=path,
        caller=caller,
        status=response.status_code,
        elapsed=elapsed,
    )
    return response


# ============================================================
# 4. FastAPI REST 端点认证（使用 JWT 验证）
# ============================================================
bearer_scheme = HTTPBearer(
    scheme_name="JWT Bearer Token",
    description="输入 JWT Token（不需要加 Bearer 前缀）",
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> VerifiedUser:
    """从 Authorization: Bearer <token> 提取并验证用户身份"""
    token = credentials.credentials

    try:
        return verifier.verify_token(token)
    except TokenExpiredError:
        raise HTTPException(status_code=401, detail="Token expired")
    except TokenInvalidError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except TokenFormatError as e:
        raise HTTPException(status_code=400, detail=f"Malformed token: {e}")


# ============================================================
# 5. 注册 FastAPI REST 接口（通过 Depends 获取用户信息）
# ============================================================
@app.get("/api/add")
async def add_api(a: int, b: int, user: VerifiedUser = Depends(get_current_user)):
    """Standard REST API (Available for Web/Mobile)"""
    result = core_add_logic(a, b)
    return {
        "result": result,
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
        },
        "source": "fastapi",
    }


@app.get("/api/whoami")
async def whoami_api(user: VerifiedUser = Depends(get_current_user)):
    """查看当前认证用户的信息（REST 版）"""
    return {
        "user": {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "claims": user.claims,
        },
        "source": "fastapi",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


```


``` python
# jwt_verifier.py

"""JWT Ed25519 Token 验证器

使用 Ed25519 公钥验证 JWT Token，提取用户信息。

依赖：
    uv add PyJWT cryptography

环境变量：
    JWT_ED25519_PUBLIC_KEY: Base64 编码的 Ed25519 公钥
"""

import base64
from dataclasses import dataclass, field
from typing import Any

import jwt
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
from cryptography.hazmat.primitives.serialization import load_pem_public_key
import os 

# ============================================================
# 异常定义
# ============================================================

class TokenExpiredError(Exception):
    """Token 已过期"""
    pass


class TokenInvalidError(Exception):
    """Token 签名无效或不可信"""
    pass


class TokenFormatError(Exception):
    """Token 格式错误，无法解析"""
    pass


# ============================================================
# 验证后的用户信息
# ============================================================

@dataclass
class VerifiedUser:
    """JWT 验证成功后返回的用户信息"""
    user_id: str
    email: str
    name: str
    claims: dict[str, Any] = field(default_factory=dict)


# ============================================================
# 辅助函数
# ============================================================

def _load_from_pem(pem_bytes: bytes) -> Ed25519PublicKey:
    """从 PEM 字节加载 Ed25519 公钥"""
    key = load_pem_public_key(pem_bytes)
    if not isinstance(key, Ed25519PublicKey):
        raise ValueError(f"PEM 中包含的不是 Ed25519 公钥，而是 {type(key).__name__}")
    return key


# ============================================================
# JWT Token 验证器
# ============================================================

class JWTTokenVerifier:
    """使用 Ed25519 公钥验证 JWT Token
    
    支持三种公钥格式：
    1. Base64(PEM)  — PEM 字符串的 Base64 编码（常用于环境变量）
    2. 原始 PEM     — -----BEGIN PUBLIC KEY----- 开头的字符串
    3. Base64(raw)  — 32 字节原始公钥的 Base64 编码
    
    Usage:
        verifier = JWTTokenVerifier("Base64EncodedPublicKey...")
        user = verifier.verify_token("eyJhbGciOi...")
    """

    def __init__(self, public_key_b64: str):
        self._public_key = self._load_public_key(public_key_b64.strip())

    @staticmethod
    def _load_public_key(key_input: str) -> Ed25519PublicKey:
        """智能加载 Ed25519 公钥，自动检测格式"""

        # 情况 1：直接就是 PEM 明文
        if key_input.startswith("-----BEGIN"):
            return _load_from_pem(key_input.encode())

        # Base64 解码
        try:
            key_bytes = base64.b64decode(key_input)
        except Exception as e:
            raise ValueError(f"无法 Base64 解码公钥: {e}")

        # 情况 2：解码后是 PEM 字符串（Base64 包裹的 PEM）
        try:
            pem_text = key_bytes.decode("utf-8")
            if pem_text.strip().startswith("-----BEGIN"):
                return _load_from_pem(pem_text.encode())
        except UnicodeDecodeError:
            pass  # 不是文本，继续尝试原始字节

        # 情况 3：解码后正好是 32 字节原始公钥
        if len(key_bytes) == 32:
            try:
                return Ed25519PublicKey.from_public_bytes(key_bytes)
            except Exception as e:
                raise ValueError(f"无法从原始字节加载公钥: {e}")

        raise ValueError(
            f"无法识别公钥格式（解码后 {len(key_bytes)} 字节）。"
            "支持: PEM 明文 / Base64(PEM) / Base64(32字节原始公钥)"
        )

    def verify_token(self, token: str) -> VerifiedUser:
        """验证 JWT Token 并返回用户信息
        
        Args:
            token: JWT Token 字符串
            
        Returns:
            VerifiedUser 对象
            
        Raises:
            TokenExpiredError: Token 已过期
            TokenInvalidError: Token 签名无效
            TokenFormatError: Token 格式错误
        """
        try:
            payload = jwt.decode(
                token,
                self._public_key,
                algorithms=["EdDSA"],
            )
        except jwt.ExpiredSignatureError:
            if not os.getenv("DEBUG"):
                raise TokenExpiredError("Token 已过期")
            # DEBUG 模式下允许过期 Token，重新解码但跳过过期验证
            payload = jwt.decode(
                token,
                self._public_key,
                algorithms=["EdDSA"],
                options={"verify_exp": False},
            )
        except jwt.InvalidTokenError as e:
            raise TokenInvalidError(f"Token 无效: {e}")
        except Exception as e:
            raise TokenFormatError(f"Token 格式错误: {e}")

        return VerifiedUser(
            user_id=payload.get("sub", ""),
            email=payload.get("email", ""),
            name=payload.get("name", ""),
            claims=payload,
        )

```