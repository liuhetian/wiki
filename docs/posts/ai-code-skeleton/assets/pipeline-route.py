"""新建模板处理流水线总入口（backend-plan.md §12.1 契约）。

前端 Wizard「▶ 生成」→ 一次 multipart 提交：primary 素材 + 勾选的 optional
字段（每个 optional key 一个独立 part）+ title/note。
只有 dual / depth 需要真正的服务端处理；expand / drag 仅文件入库。
"""
from fastapi import APIRouter, Depends, Form, UploadFile
from sqlmodel import Session

from ..db import get_session
from ..models import Kind, PipelineSubmitOut

router = APIRouter()


@router.post("/pipeline/{kind}", response_model=PipelineSubmitOut, status_code=201)
async def submit_pipeline(
    kind: Kind,
    primary: UploadFile,
    title: str = Form("", description="缺省取 primary 文件名（去扩展名）"),
    note: str = Form(""),
    secondary: UploadFile | None = None,    # dual 可选：黑底抠图版 → 走三角测量而非 SAM
    prompts: str | None = Form(None, description="dual 可选：SAM prompts，每行一个"),
    idleFrame: UploadFile | None = None,    # drag 可选：拖入前静态帧
    session: Session = Depends(get_session),
) -> PipelineSubmitOut:
    """提交一次完整 pipeline。委托 services.pipelines.submit()：

    1. 所有上传文件先走 storage.save_upload()（落盘 + OSS + files 表）拿 sha256
    2. 创建 resource：group='templates'，v1 占位版本（url 空、params = 默认值），
       用户生成后进抽屉调位置（§12.7）
    3. 按 PIPELINES[kind] 建 jobs（pending）：
       - dual：有 secondary → tri 管线，否则 SAM 管线（prompts 进 input_json）
       - depth：process-depth + process-compose 两个连续 job
       - expand/drag：无 job，文件 URL 直接写进 v1
    4. 立即把 jobs 逐个 submit 到线程池（前端无需再手动逐个 run）
    5. 返回 { resource_id, jobs: [job_id…] } → 前端开始轮询 /resources/{id}/jobs

    非 wizard kind（item/item-bg/icon/gift-bg）→ 422：请直接走 /resources + /upload。
    """
    ...
