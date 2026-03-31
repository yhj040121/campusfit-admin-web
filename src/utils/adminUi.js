const DATETIME_WITH_MINUTES = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/;
const DATETIME_WITH_SECONDS = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/;

function toSafeText(value) {
  return String(value || "").trim();
}

export function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const text = toSafeText(value);
  if (!text) {
    return 0;
  }

  const normalized = text.replace(/[^\d.-]/g, "");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatCurrency(value, prefix = "￥") {
  return `${prefix}${toNumber(value).toFixed(2)}`;
}

export function formatCompactNumber(value) {
  const numeric = toNumber(value);
  if (numeric >= 10000) {
    return `${(numeric / 10000).toFixed(numeric >= 100000 ? 0 : 1)}w`;
  }
  return String(numeric);
}

export function formatAdminCode(prefix, value, pad = 6) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return `${prefix}-${"0".repeat(Math.max(Number(pad) || 6, 1))}`;
  }
  return `${prefix}-${String(Math.trunc(numeric)).padStart(Math.max(Number(pad) || 6, 1), "0")}`;
}

export function matchesKeyword(keyword, values) {
  const needle = String(keyword || "").trim().toLowerCase();
  if (!needle) {
    return true;
  }

  const list = Array.isArray(values) ? values : [values];
  return list.some((value) => String(value ?? "").toLowerCase().includes(needle));
}

export function normalizeDateTimeValue(value) {
  const text = toSafeText(value);
  if (!text || text === "-") {
    return "";
  }

  const normalized = text
    .replace("T", " ")
    .replace(/(\.\d+)?Z$/, "");

  if (DATETIME_WITH_SECONDS.test(normalized)) {
    return normalized;
  }

  if (DATETIME_WITH_MINUTES.test(normalized)) {
    return `${normalized}:00`;
  }

  return normalized;
}

export function formatApiBaseLabel(value) {
  const text = toSafeText(value);
  if (!text) {
    return "未连接";
  }

  try {
    const url = new URL(text);
    return `${url.hostname}${url.port ? `:${url.port}` : ""}`;
  } catch (error) {
    return text;
  }
}

function matchesAny(value, keywords) {
  const text = toSafeText(value).toLowerCase();
  return keywords.some((keyword) => text.includes(String(keyword).toLowerCase()));
}

export function resolveProductStatusType(value) {
  if (matchesAny(value, ["已校验", "正常", "valid", "ok", "已生效"])) {
    return "success";
  }
  if (matchesAny(value, ["失效", "异常", "无效", "失败", "error"])) {
    return "danger";
  }
  return "warning";
}

export function resolveMerchantStatusType(value) {
  if (matchesAny(value, ["合作中", "投放中", "进行中", "active"])) {
    return "success";
  }
  if (matchesAny(value, ["暂停", "待沟通", "筹备", "pending"])) {
    return "warning";
  }
  return "info";
}

export function resolveCooperationStatusType(row) {
  const statusCode = toNumber(row?.statusCode);
  if (statusCode === 3) {
    return "success";
  }
  if (statusCode === 4) {
    return "danger";
  }
  if (statusCode === 2) {
    return "warning";
  }
  if (statusCode === 1) {
    return "primary";
  }
  return "info";
}

export function resolveActivityStatusType(row) {
  const statusCode = toSafeText(row?.statusCode).toUpperCase();
  if (!row?.active || statusCode === "FINISHED") {
    return "info";
  }
  if (statusCode === "RECRUITING") {
    return "warning";
  }
  return "success";
}
