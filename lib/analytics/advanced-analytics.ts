import { supabaseAdmin } from "../supabase/client"

export class AdvancedAnalytics {
  // Métricas de negocio principales
  async getBusinessMetrics(dateRange: { from: Date; to: Date }) {
    try {
      const [
        totalUsers,
        activeUsers,
        totalRequests,
        completedRequests,
        totalRevenue,
        averageOrderValue,
        userRetention,
        providerUtilization,
      ] = await Promise.all([
        this.getTotalUsers(dateRange),
        this.getActiveUsers(dateRange),
        this.getTotalRequests(dateRange),
        this.getCompletedRequests(dateRange),
        this.getTotalRevenue(dateRange),
        this.getAverageOrderValue(dateRange),
        this.getUserRetention(dateRange),
        this.getProviderUtilization(dateRange),
      ])

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          growth: await this.getUserGrowthRate(dateRange),
        },
        requests: {
          total: totalRequests,
          completed: completedRequests,
          completionRate: totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0,
          growth: await this.getRequestGrowthRate(dateRange),
        },
        revenue: {
          total: totalRevenue,
          averageOrderValue,
          growth: await this.getRevenueGrowthRate(dateRange),
        },
        retention: userRetention,
        utilization: providerUtilization,
      }
    } catch (error) {
      console.error("Error obteniendo métricas de negocio:", error)
      throw error
    }
  }

  // Análisis de cohortes
  async getCohortAnalysis(months = 12) {
    try {
      const cohorts = []
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      for (let i = 0; i < months; i++) {
        const cohortDate = new Date(startDate)
        cohortDate.setMonth(startDate.getMonth() + i)

        const cohortStart = new Date(cohortDate.getFullYear(), cohortDate.getMonth(), 1)
        const cohortEnd = new Date(cohortDate.getFullYear(), cohortDate.getMonth() + 1, 0)

        // Usuarios que se registraron en este mes
        const { data: newUsers, error: usersError } = await supabaseAdmin
          .from("users")
          .select("id, created_at")
          .gte("created_at", cohortStart.toISOString())
          .lte("created_at", cohortEnd.toISOString())

        if (usersError) {
          console.error("Error obteniendo usuarios de cohorte:", usersError)
          continue
        }

        if (!newUsers || newUsers.length === 0) continue

        const cohortData = {
          month: cohortStart.toISOString().substring(0, 7),
          newUsers: newUsers.length,
          retention: [],
        }

        // Calcular retención para cada mes posterior
        for (let j = 0; j <= Math.min(11, months - i - 1); j++) {
          const retentionStart = new Date(cohortStart)
          retentionStart.setMonth(retentionStart.getMonth() + j)
          const retentionEnd = new Date(retentionStart)
          retentionEnd.setMonth(retentionEnd.getMonth() + 1)

          const { data: activeRequests, error: requestsError } = await supabaseAdmin
            .from("service_requests")
            .select("client_id")
            .in(
              "client_id",
              newUsers.map((u) => u.id),
            )
            .gte("created_at", retentionStart.toISOString())
            .lt("created_at", retentionEnd.toISOString())

          if (requestsError) {
            console.error("Error obteniendo solicitudes de retención:", requestsError)
            continue
          }

          const uniqueActiveUsers = new Set(activeRequests?.map((r) => r.client_id) || []).size

          cohortData.retention.push({
            month: j,
            rate: (uniqueActiveUsers / newUsers.length) * 100,
          })
        }

        cohorts.push(cohortData)
      }

      return cohorts
    } catch (error) {
      console.error("Error en análisis de cohortes:", error)
      throw error
    }
  }

  // Análisis de funnel de conversión
  async getConversionFunnel(dateRange: { from: Date; to: Date }) {
    try {
      const [visitors, signups, firstRequest, completedRequest, repeatCustomers] = await Promise.all([
        this.getEstimatedVisitors(dateRange),
        this.getSignups(dateRange),
        this.getFirstRequests(dateRange),
        this.getCompletedFirstRequests(dateRange),
        this.getRepeatCustomers(dateRange),
      ])

      return {
        stages: [
          { name: "Visitantes", count: visitors, rate: 100 },
          { name: "Registros", count: signups, rate: (signups / visitors) * 100 },
          { name: "Primera solicitud", count: firstRequest, rate: (firstRequest / signups) * 100 },
          { name: "Solicitud completada", count: completedRequest, rate: (completedRequest / firstRequest) * 100 },
          { name: "Clientes recurrentes", count: repeatCustomers, rate: (repeatCustomers / completedRequest) * 100 },
        ],
        overallConversion: (repeatCustomers / visitors) * 100,
      }
    } catch (error) {
      console.error("Error en análisis de funnel:", error)
      throw error
    }
  }

  // Análisis de segmentación de usuarios
  async getUserSegmentation() {
    try {
      const segments = await Promise.all([
        this.getHighValueCustomers(),
        this.getFrequentUsers(),
        this.getChurnRiskUsers(),
        this.getNewUsers(),
        this.getInactiveUsers(),
      ])

      return {
        highValue: segments[0],
        frequent: segments[1],
        churnRisk: segments[2],
        new: segments[3],
        inactive: segments[4],
      }
    } catch (error) {
      console.error("Error en segmentación de usuarios:", error)
      throw error
    }
  }

  // Análisis predictivo de churn
  async getChurnPrediction() {
    try {
      const { data: users, error } = await supabaseAdmin.from("users").select(`
          id,
          name,
          email,
          created_at,
          service_requests:service_requests!client_id(
            id,
            created_at,
            status
          )
        `)

      if (error) {
        console.error("Error obteniendo usuarios para predicción de churn:", error)
        return []
      }

      const predictions =
        users?.map((user) => {
          const requests = user.service_requests || []
          const sortedRequests = requests.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )

          const daysSinceLastRequest =
            sortedRequests.length > 0
              ? Math.floor((Date.now() - new Date(sortedRequests[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
              : 999

          const requestFrequency = requests.length
          const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))

          // Algoritmo simple de predicción de churn
          let churnScore = 0

          // Días desde última solicitud (peso: 40%)
          if (daysSinceLastRequest > 90) churnScore += 40
          else if (daysSinceLastRequest > 60) churnScore += 30
          else if (daysSinceLastRequest > 30) churnScore += 20
          else if (daysSinceLastRequest > 14) churnScore += 10

          // Frecuencia de uso (peso: 30%)
          if (requestFrequency === 0) churnScore += 30
          else if (requestFrequency === 1) churnScore += 20
          else if (requestFrequency < 5) churnScore += 10

          // Edad de la cuenta (peso: 20%)
          if (accountAge < 7) churnScore += 20
          else if (accountAge < 30) churnScore += 10

          // Tendencia reciente (peso: 10%)
          const recentRequests = requests.filter(
            (r) => Date.now() - new Date(r.created_at).getTime() < 30 * 24 * 60 * 60 * 1000,
          ).length

          if (recentRequests === 0 && requestFrequency > 0) churnScore += 10

          return {
            userId: user.id,
            userName: user.name,
            email: user.email,
            churnScore,
            riskLevel: churnScore > 70 ? "HIGH" : churnScore > 40 ? "MEDIUM" : "LOW",
            factors: {
              daysSinceLastRequest,
              requestFrequency,
              accountAge,
              recentRequests,
            },
          }
        }) || []

      return predictions.filter((p) => p.churnScore > 30).sort((a, b) => b.churnScore - a.churnScore)
    } catch (error) {
      console.error("Error en predicción de churn:", error)
      throw error
    }
  }

  // Análisis de satisfacción del cliente
  async getCustomerSatisfactionAnalysis(dateRange: { from: Date; to: Date }) {
    try {
      const { data: reviews, error } = await supabaseAdmin
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          service_requests!inner(
            id,
            service_types!inner(
              name
            )
          )
        `)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())

      if (error) {
        console.error("Error obteniendo reviews:", error)
        return null
      }

      const totalReviews = reviews?.length || 0
      const averageRating = totalReviews > 0 ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0

      const ratingDistribution = {
        5: reviews?.filter((r) => r.rating === 5).length || 0,
        4: reviews?.filter((r) => r.rating === 4).length || 0,
        3: reviews?.filter((r) => r.rating === 3).length || 0,
        2: reviews?.filter((r) => r.rating === 2).length || 0,
        1: reviews?.filter((r) => r.rating === 1).length || 0,
      }

      const nps = this.calculateNPS(reviews || [])
      const satisfactionByService = this.getSatisfactionByService(reviews || [])
      const sentimentAnalysis = await this.analyzeSentiment(reviews || [])

      return {
        overview: {
          totalReviews,
          averageRating,
          nps,
          ratingDistribution,
        },
        byService: satisfactionByService,
        sentiment: sentimentAnalysis,
        trends: await this.getSatisfactionTrends(dateRange),
      }
    } catch (error) {
      console.error("Error en análisis de satisfacción:", error)
      throw error
    }
  }

  // Métodos auxiliares privados
  private async getTotalUsers(dateRange: { from: Date; to: Date }) {
    const { count, error } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo total de usuarios:", error)
      return 0
    }

    return count || 0
  }

  private async getActiveUsers(dateRange: { from: Date; to: Date }) {
    const { data: activeUserIds, error } = await supabaseAdmin
      .from("service_requests")
      .select("client_id")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo usuarios activos:", error)
      return 0
    }

    const uniqueUsers = new Set(activeUserIds?.map((r) => r.client_id) || [])
    return uniqueUsers.size
  }

  private async getTotalRequests(dateRange: { from: Date; to: Date }) {
    const { count, error } = await supabaseAdmin
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo total de solicitudes:", error)
      return 0
    }

    return count || 0
  }

  private async getCompletedRequests(dateRange: { from: Date; to: Date }) {
    const { count, error } = await supabaseAdmin
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "COMPLETED")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo solicitudes completadas:", error)
      return 0
    }

    return count || 0
  }

  private async getTotalRevenue(dateRange: { from: Date; to: Date }) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("status", "APPROVED")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo ingresos totales:", error)
      return 0
    }

    return data?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  private async getAverageOrderValue(dateRange: { from: Date; to: Date }) {
    const { data, error } = await supabaseAdmin
      .from("payments")
      .select("amount")
      .eq("status", "APPROVED")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo valor promedio de orden:", error)
      return 0
    }

    if (!data || data.length === 0) return 0

    const total = data.reduce((sum, payment) => sum + payment.amount, 0)
    return total / data.length
  }

  private async getUserRetention(dateRange: { from: Date; to: Date }) {
    // Usuarios nuevos en el período
    const { count: newUsers, error: newUsersError } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (newUsersError) {
      console.error("Error obteniendo usuarios nuevos:", newUsersError)
      return 0
    }

    // Usuarios que regresaron después del período
    const { data: userIds, error: userIdsError } = await supabaseAdmin
      .from("users")
      .select("id")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (userIdsError || !userIds) {
      console.error("Error obteniendo IDs de usuarios:", userIdsError)
      return 0
    }

    const { count: retainedUsers, error: retainedError } = await supabaseAdmin
      .from("service_requests")
      .select("*", { count: "exact", head: true })
      .in(
        "client_id",
        userIds.map((u) => u.id),
      )
      .gt("created_at", dateRange.to.toISOString())

    if (retainedError) {
      console.error("Error obteniendo usuarios retenidos:", retainedError)
      return 0
    }

    return newUsers && newUsers > 0 ? ((retainedUsers || 0) / newUsers) * 100 : 0
  }

  private async getProviderUtilization(dateRange: { from: Date; to: Date }) {
    const { count: totalProviders, error: totalError } = await supabaseAdmin
      .from("providers")
      .select("*", { count: "exact", head: true })

    if (totalError) {
      console.error("Error obteniendo total de proveedores:", totalError)
      return 0
    }

    const { data: activeProviderIds, error: activeError } = await supabaseAdmin
      .from("service_requests")
      .select("provider_id")
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (activeError) {
      console.error("Error obteniendo proveedores activos:", activeError)
      return 0
    }

    const uniqueActiveProviders = new Set(activeProviderIds?.map((r) => r.provider_id) || [])

    return totalProviders && totalProviders > 0 ? (uniqueActiveProviders.size / totalProviders) * 100 : 0
  }

  private calculateNPS(reviews: any[]) {
    if (reviews.length === 0) return 0

    const promoters = reviews.filter((r) => r.rating >= 4).length
    const detractors = reviews.filter((r) => r.rating <= 2).length

    return ((promoters - detractors) / reviews.length) * 100
  }

  private getSatisfactionByService(reviews: any[]) {
    const serviceGroups = reviews.reduce(
      (acc, review) => {
        const serviceName = review.service_requests?.service_types?.name || "Desconocido"
        if (!acc[serviceName]) {
          acc[serviceName] = []
        }
        acc[serviceName].push(review.rating)
        return acc
      },
      {} as Record<string, number[]>,
    )

    return Object.entries(serviceGroups).map(([service, ratings]) => ({
      service,
      averageRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      totalReviews: ratings.length,
    }))
  }

  private async analyzeSentiment(reviews: any[]) {
    // Análisis de sentimiento básico basado en palabras clave
    const positiveWords = ["excelente", "bueno", "genial", "perfecto", "recomiendo", "satisfecho"]
    const negativeWords = ["malo", "terrible", "pésimo", "decepcionante", "no recomiendo"]

    const sentiment = reviews.map((review) => {
      if (!review.comment) return { rating: review.rating, sentiment: "neutral" }

      const comment = review.comment.toLowerCase()
      const positiveCount = positiveWords.filter((word) => comment.includes(word)).length
      const negativeCount = negativeWords.filter((word) => comment.includes(word)).length

      let sentiment = "neutral"
      if (positiveCount > negativeCount) sentiment = "positive"
      else if (negativeCount > positiveCount) sentiment = "negative"

      return { rating: review.rating, sentiment }
    })

    return {
      positive: sentiment.filter((s) => s.sentiment === "positive").length,
      negative: sentiment.filter((s) => s.sentiment === "negative").length,
      neutral: sentiment.filter((s) => s.sentiment === "neutral").length,
    }
  }

  private async getSatisfactionTrends(dateRange: { from: Date; to: Date }) {
    const months = []
    const current = new Date(dateRange.from)

    while (current <= dateRange.to) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

      const { data: monthReviews, error } = await supabaseAdmin
        .from("reviews")
        .select("rating")
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())

      if (error) {
        console.error("Error obteniendo reviews del mes:", error)
        current.setMonth(current.getMonth() + 1)
        continue
      }

      const averageRating =
        monthReviews && monthReviews.length > 0
          ? monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
          : 0

      months.push({
        month: monthStart.toISOString().substring(0, 7),
        averageRating,
        totalReviews: monthReviews?.length || 0,
      })

      current.setMonth(current.getMonth() + 1)
    }

    return months
  }

  // Métodos auxiliares para funnel
  private async getEstimatedVisitors(dateRange: { from: Date; to: Date }) {
    const signups = await this.getSignups(dateRange)
    return Math.floor(signups * 10) // Estimamos 10% de conversión de visitante a registro
  }

  private async getSignups(dateRange: { from: Date; to: Date }) {
    const { count, error } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo registros:", error)
      return 0
    }

    return count || 0
  }

  private async getFirstRequests(dateRange: { from: Date; to: Date }) {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        service_requests!client_id(id, created_at)
      `)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo primeras solicitudes:", error)
      return 0
    }

    return users?.filter((user) => user.service_requests && user.service_requests.length > 0).length || 0
  }

  private async getCompletedFirstRequests(dateRange: { from: Date; to: Date }) {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        service_requests!client_id(id, created_at, status)
      `)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo primeras solicitudes completadas:", error)
      return 0
    }

    return (
      users?.filter((user) => user.service_requests && user.service_requests.some((req) => req.status === "COMPLETED"))
        .length || 0
    )
  }

  private async getRepeatCustomers(dateRange: { from: Date; to: Date }) {
    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        service_requests!client_id(id, status)
      `)
      .gte("created_at", dateRange.from.toISOString())
      .lte("created_at", dateRange.to.toISOString())

    if (error) {
      console.error("Error obteniendo clientes recurrentes:", error)
      return 0
    }

    return (
      users?.filter((user) => {
        const completedRequests = user.service_requests?.filter((req) => req.status === "COMPLETED") || []
        return completedRequests.length > 1
      }).length || 0
    )
  }

  // Métodos para segmentación
  private async getHighValueCustomers() {
    const { data: users, error } = await supabaseAdmin.from("users").select(`
        id,
        name,
        email,
        payments!client_id(amount, status),
        service_requests!client_id(id, status)
      `)

    if (error) {
      console.error("Error obteniendo clientes de alto valor:", error)
      return []
    }

    return (
      users
        ?.filter((user) => {
          const totalSpent =
            user.payments?.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0) || 0
          const completedRequests = user.service_requests?.filter((req) => req.status === "COMPLETED").length || 0
          return totalSpent > 10000 || completedRequests > 10
        })
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          totalSpent: user.payments?.filter((p) => p.status === "APPROVED").reduce((sum, p) => sum + p.amount, 0) || 0,
          completedRequests: user.service_requests?.filter((req) => req.status === "COMPLETED").length || 0,
        })) || []
    )
  }

  private async getFrequentUsers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: users, error } = await supabaseAdmin.from("users").select(`
        id,
        name,
        email,
        service_requests!client_id(id, created_at)
      `)

    if (error) {
      console.error("Error obteniendo usuarios frecuentes:", error)
      return []
    }

    return (
      users
        ?.filter((user) => {
          const recentRequests =
            user.service_requests?.filter((req) => new Date(req.created_at) >= thirtyDaysAgo).length || 0
          return recentRequests >= 3
        })
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          recentRequests: user.service_requests?.filter((req) => new Date(req.created_at) >= thirtyDaysAgo).length || 0,
        })) || []
    )
  }

  private async getChurnRiskUsers() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const { data: users, error } = await supabaseAdmin.from("users").select(`
        id,
        name,
        email,
        service_requests!client_id(id, created_at)
      `)

    if (error) {
      console.error("Error obteniendo usuarios en riesgo de churn:", error)
      return []
    }

    return (
      users
        ?.filter((user) => {
          const requests = user.service_requests || []
          const hasOldRequests = requests.some((req) => new Date(req.created_at) < thirtyDaysAgo)
          const hasRecentRequests = requests.some((req) => new Date(req.created_at) >= thirtyDaysAgo)
          return hasOldRequests && !hasRecentRequests
        })
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          lastRequestDate: user.service_requests?.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0]?.created_at,
        })) || []
    )
  }

  private async getNewUsers() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())

    if (error) {
      console.error("Error obteniendo usuarios nuevos:", error)
      return []
    }

    return users || []
  }

  private async getInactiveUsers() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const { data: users, error } = await supabaseAdmin.from("users").select(`
        id,
        name,
        email,
        created_at,
        service_requests!client_id(id, created_at)
      `)

    if (error) {
      console.error("Error obteniendo usuarios inactivos:", error)
      return []
    }

    return (
      users
        ?.filter((user) => {
          const recentRequests = user.service_requests?.filter((req) => new Date(req.created_at) >= ninetyDaysAgo) || []
          return recentRequests.length === 0
        })
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        })) || []
    )
  }

  private async getUserGrowthRate(dateRange: { from: Date; to: Date }) {
    const currentPeriod = await this.getTotalUsers(dateRange)
    const previousPeriod = await this.getTotalUsers({
      from: new Date(dateRange.from.getTime() - (dateRange.to.getTime() - dateRange.from.getTime())),
      to: dateRange.from,
    })

    return previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0
  }

  private async getRequestGrowthRate(dateRange: { from: Date; to: Date }) {
    const currentPeriod = await this.getTotalRequests(dateRange)
    const previousPeriod = await this.getTotalRequests({
      from: new Date(dateRange.from.getTime() - (dateRange.to.getTime() - dateRange.from.getTime())),
      to: dateRange.from,
    })

    return previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0
  }

  private async getRevenueGrowthRate(dateRange: { from: Date; to: Date }) {
    const currentPeriod = await this.getTotalRevenue(dateRange)
    const previousPeriod = await this.getTotalRevenue({
      from: new Date(dateRange.from.getTime() - (dateRange.to.getTime() - dateRange.from.getTime())),
      to: dateRange.from,
    })

    return previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0
  }
}

export const advancedAnalytics = new AdvancedAnalytics()
