import { useState } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    initialInvestment: '',
    monthlyContribution: '',
    interestRate: '',
    years: '',
    compoundFrequency: 'monthly'
  })
  const [results, setResults] = useState(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const formatNumber = (value) => {
    if (!value) return ''
    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) return ''
    return new Intl.NumberFormat('vi-VN').format(numericValue) + ' ₫'
  }

  const parseNumber = (value) => {
    return value.replace(/\./g, '').replace(/₫/g, '').replace(/\s/g, '').trim()
  }

  const handleInputChange = (field, value) => {
    const numericValue = parseNumber(value)
    setFormData({ ...formData, [field]: numericValue })
  }

  const calculateCompoundInterest = () => {
    const P = parseFloat(formData.initialInvestment) || 0
    const PMT = parseFloat(formData.monthlyContribution) || 0
    const r = (parseFloat(formData.interestRate) || 0) / 100
    const n = parseFloat(formData.years) || 0

    const frequencies = {
      daily: 365,
      monthly: 12,
      quarterly: 4,
      annually: 1
    }
    const m = frequencies[formData.compoundFrequency]

    const yearlyBreakdown = []
    let totalContributions = P

    for (let year = 1; year <= n; year++) {
      const monthsElapsed = year * 12
      const periodsElapsed = year * m

      const contributionsPeriod = PMT * monthsElapsed
      totalContributions = P + contributionsPeriod

      const futureValuePrincipal = P * Math.pow(1 + r / m, periodsElapsed)

      const futureValueContributions = PMT *
        ((Math.pow(1 + r / m, periodsElapsed) - 1) / (r / m)) *
        (m / 12)

      const futureValue = futureValuePrincipal + futureValueContributions
      const interestEarned = futureValue - totalContributions

      yearlyBreakdown.push({
        year,
        totalContributions,
        futureValue,
        interestEarned
      })
    }

    const finalYear = yearlyBreakdown[yearlyBreakdown.length - 1]
    const totalInterest = finalYear ? finalYear.futureValue - finalYear.totalContributions : 0

    setResults({
      futureValue: finalYear ? finalYear.futureValue : 0,
      totalContributions: finalYear ? finalYear.totalContributions : 0,
      totalInterest,
      yearlyBreakdown
    })
  }

  const resetCalculator = () => {
    setFormData({
      initialInvestment: '',
      monthlyContribution: '',
      interestRate: '',
      years: '',
      compoundFrequency: 'monthly'
    })
    setResults(null)
    setShowBreakdown(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value)
  }

  const canCalculate = () => {
    return formData.initialInvestment &&
           formData.monthlyContribution &&
           formData.interestRate &&
           formData.years &&
           parseFloat(formData.initialInvestment) >= 0 &&
           parseFloat(formData.monthlyContribution) >= 0 &&
           parseFloat(formData.interestRate) > 0 &&
           parseFloat(formData.years) > 0
  }

  return (
    <div className="app">
      <header>
        <h1>Máy Tính Lãi Kép</h1>
        <p className="subtitle">Tính toán tăng trưởng đầu tư của bạn theo thời gian</p>
      </header>

      <div className="calculator-container">
        <div className="input-section">
          <h2>Thông Tin Đầu Tư</h2>

          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="initialInvestment">Số Vốn Ban Đầu</label>
              <input
                id="initialInvestment"
                type="text"
                value={formatNumber(formData.initialInvestment)}
                onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
                placeholder="100.000.000 ₫"
              />
            </div>

            <div className="input-group">
              <label htmlFor="monthlyContribution">Đóng Góp Hàng Tháng</label>
              <input
                id="monthlyContribution"
                type="text"
                value={formatNumber(formData.monthlyContribution)}
                onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                placeholder="5.000.000 ₫"
              />
            </div>

            <div className="input-group">
              <label htmlFor="interestRate">Lãi Suất Hàng Năm (%)</label>
              <input
                id="interestRate"
                type="number"
                min="0"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                placeholder="7"
              />
            </div>

            <div className="input-group">
              <label htmlFor="years">Thời Gian Đầu Tư (Năm)</label>
              <input
                id="years"
                type="number"
                min="1"
                step="1"
                value={formData.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
                placeholder="20"
              />
            </div>

            <div className="input-group">
              <label htmlFor="compoundFrequency">Tần Suất Ghép Lãi</label>
              <select
                id="compoundFrequency"
                value={formData.compoundFrequency}
                onChange={(e) => handleInputChange('compoundFrequency', e.target.value)}
              >
                <option value="daily">Hàng Ngày</option>
                <option value="monthly">Hàng Tháng</option>
                <option value="quarterly">Hàng Quý</option>
                <option value="annually">Hàng Năm</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={calculateCompoundInterest}
              className="btn btn-primary"
              disabled={!canCalculate()}
            >
              Tính Toán
            </button>
            {results && (
              <button onClick={resetCalculator} className="btn btn-secondary">
                Đặt Lại
              </button>
            )}
          </div>
        </div>

        {results && (
          <div className="results-section">
            <h2>Kết Quả Đầu Tư Của Bạn</h2>

            <div className="results-summary">
              <div className="result-card primary">
                <h3>Giá Trị Tương Lai</h3>
                <div className="result-value">{formatCurrency(results.futureValue)}</div>
              </div>

              <div className="result-card">
                <h3>Vốn Gốc</h3>
                <div className="result-value">{formatCurrency(results.totalContributions)}</div>
              </div>

              <div className="result-card success">
                <h3>Tổng Lãi Kiếm Được</h3>
                <div className="result-value">{formatCurrency(results.totalInterest)}</div>
              </div>
            </div>

            <div className="chart-section">
              <h3>Tăng Trưởng Đầu Tư Theo Thời Gian</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.yearlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    label={{ value: 'Năm', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                    label={{ value: 'Số Tiền (VND)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Năm ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalContributions"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Vốn Gốc"
                  />
                  <Line
                    type="monotone"
                    dataKey="futureValue"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Vốn Gốc + Lãi"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="breakdown">
              <div className="breakdown-header-section">
                <h3>Chi Tiết Theo Từng Năm</h3>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="btn btn-toggle"
                >
                  {showBreakdown ? 'Ẩn Chi Tiết' : 'Hiển Thị Chi Tiết'}
                </button>
              </div>

              {showBreakdown && (
                <div className="breakdown-table">
                  <div className="breakdown-header">
                    <div>Năm</div>
                    <div>Vốn Gốc</div>
                    <div>Lãi Kiếm Được</div>
                    <div>Giá Trị Tương Lai</div>
                  </div>
                  {results.yearlyBreakdown.map((year) => (
                    <div key={year.year} className="breakdown-row">
                      <div>{year.year}</div>
                      <div>{formatCurrency(year.totalContributions)}</div>
                      <div>{formatCurrency(year.interestEarned)}</div>
                      <div>{formatCurrency(year.futureValue)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
