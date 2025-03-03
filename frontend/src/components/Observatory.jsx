import React from 'react';
import { Card, Row, Col, Button, message, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

// 4个挡位配置
const levels = [
  {
    label: '幽灵',
    trigger: '观测站+密码',
    exponent: 2,
    comment: '一倍',
  },
  {
    label: '强袭',
    trigger: '观测站强袭+密码',
    exponent: 4,
    comment: '十倍',
  },
  {
    label: '泰坦',
    trigger: '观测站泰坦+密码',
    exponent: 8,
    comment: '百倍',
  },
  {
    label: '全境',
    trigger: '观测站全境+密码',
    exponent: 16,
    comment: 'ALL IN',
  },
];

/**
 * 真实 4 位密码
 */
function getRealPassword(exponent) {
  const now = new Date();
  // 严格使用UTC时间
  const M = now.getUTCMonth() + 1; // 1~12
  const D = now.getUTCDate();      // 1~31
  const H = now.getUTCHours();     // 0~23

  // 修改计算逻辑：使用相加而非拼接
  const baseNum = M + D + H;

  const bigVal = Math.pow(baseNum, exponent);
  const last4 = bigVal % 10000;

  return last4.toString().padStart(4, '0');
}

/**
 * 当前用户能否看到/复制真实密码
 * - 未登录 => 全部 "****"
 * - 管理员 => 全部真实密码
 * - 普通用户 => 仅前2挡位(0/1)真实密码, 后2(2/3) => "****"
 */
function getEffectivePassword(idx, realPwd, isLoggedIn, isAdmin) {
  if (!isLoggedIn) return '****';
  if (isAdmin) return realPwd;
  // 普通用户 => 仅前2挡位显示密码
  return (idx < 2) ? realPwd : '****';
}

/**
 * 是否可复制该挡位
 */
function canCopy(idx, isLoggedIn, isAdmin) {
  if (!isLoggedIn) return false;
  if (isAdmin) return true;
  // 普通用户 => 只能复制前2个
  return (idx < 2);
}

/**
 * 若按钮被禁用，返回原因；否则返回空字符串
 */
function getDisabledReason(idx, isLoggedIn, isAdmin) {
  if (!isLoggedIn) {
    return '请先登录后才可显示';
  }
  if (isAdmin) {
    return ''; // 管理员不禁用，无需理由
  }
  // 普通用户，idx >= 2 => 后2个挡位禁用
  if (idx >= 2) {
    return '只有管理员才能使用此挡位';
  }
  return ''; // 可用
}

/**
 * 去掉 "+密码"
 */
function getTriggerPrefix(originalTrigger) {
  return originalTrigger.replace('+密码', '');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      message.success('已复制到剪贴板');
    })
    .catch(() => {
      message.error('复制失败');
    });
}

function Observatory({ isLoggedIn, isAdmin }) {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 20 }}>观测站</h2>

      <Row gutter={[16, 16]}>
        {levels.map((lvl, idx) => {
          // 1) 计算真实密码
          const realPwd = getRealPassword(lvl.exponent);

          // 2) 根据权限决定显示"****"还是真实密码
          const finalPwd = getEffectivePassword(idx, realPwd, isLoggedIn, isAdmin);

          // 3) 生成可复制的最终字符串
          const prefix = getTriggerPrefix(lvl.trigger);
          const finalTrigger = prefix + finalPwd;

          // 4) 判断按钮是否可用
          const copyAllowed = canCopy(idx, isLoggedIn, isAdmin);

          // 5) 若禁用 => 返回原因，用 Tooltip 提示
          const disabledReason = getDisabledReason(idx, isLoggedIn, isAdmin);

          return (
            <Col xs={24} sm={12} md={6} key={lvl.label}>
              <Card
                title={lvl.label}
                bordered={false}
                style={{ textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              >
                <div style={{ fontSize: '14px', marginBottom: 8 }}>
                  挡位说明：<strong>{lvl.comment}</strong>
                </div>

                {/* 触发关键词 + 复制按钮 */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6 }}>
                    触发关键词：
                    <strong style={{ color: '#333' }}>
                      {finalTrigger}
                    </strong>
                  </div>

                  <Tooltip
                    title={disabledReason} // 若为空字符串则不显示
                    mouseEnterDelay={0.2}  // 鼠标悬停0.2s后显示提示
                  >
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(finalTrigger)}
                      size="small"
                      disabled={!copyAllowed}
                    >
                      复制触发词
                    </Button>
                  </Tooltip>
                </div>

                {/* 显示4位密码(或 "****") */}
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                  {finalPwd}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                  当前 4 位密码
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default Observatory;
