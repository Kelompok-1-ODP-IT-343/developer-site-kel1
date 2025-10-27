'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, CheckCircle, XCircle, User, Home, Building, FileText, Calendar, DollarSign, Eye } from 'lucide-react'
import { toast } from 'sonner'
import coreApi, { getKPRApplicationDetail, approveKPRApplication, rejectKPRApplication } from '@/lib/coreApi'

interface KPRApplicationData {
  applicationId: number
  applicationNumber: string
  propertyType: string
  propertyValue: number
  propertyAddress: string
  propertyCertificateType: string
  developerName: string
  loanAmount: number
  loanTermYears: number
  interestRate: number
  monthlyInstallment: number
  downPayment: number
  ltvRatio: number
  purpose: string
  status: string
  submittedAt: string
  userInfo: {
    fullName: string
    nik: string
    npwp: string
    birthPlace: string
    gender: string
    maritalStatus: string
    address: string
    city: string
    province: string
    postalCode: string
    occupation: string
    companyName: string
    monthlyIncome: number
    phone: string
    email: string
  }
  propertyInfo: {
    title: string
    description: string
    address: string
    city: string
    province: string
    landArea: number
    buildingArea: number
    bedrooms: number
    bathrooms: number
    floors: number
    yearBuilt: number
    price: number
    certificateType: string
    certificateNumber: string
  }
  developerInfo: {
    companyName: string
    contactPerson: string
    phone: string
    email: string
    address: string
    city: string
    province: string
    establishedYear: number
    description: string
    specialization: string
    partnershipLevel: string
  }
  kprRateInfo: {
    rateName: string
    rateType: string
    propertyType: string
    customerSegment: string
    effectiveRate: number
    minLoanAmount: number
    maxLoanAmount: number
    minTermYears: number
    maxTermYears: number
    maxLtvRatio: number
    adminFee: number
    appraisalFee: number
    insuranceRate: number
  }
  documents: Array<{
    documentId: number
    documentType: string
    documentName: string
    filePath: string
    fileSize: number
    mimeType: string
    isVerified: boolean
    uploadedAt: string
  }>
  approvalWorkflows: Array<{
    workflowId: number
    stage: string
    status: string
    priority: string
    dueDate: string
    assignedToName: string
  }>
}

export default function KPRDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [kprData, setKprData] = useState<KPRApplicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [documentModal, setDocumentModal] = useState<{
    isOpen: boolean
    document: any | null
  }>({
    isOpen: false,
    document: null
  })

  const applicationId = params.id as string

  useEffect(() => {
    fetchKPRDetail()
  }, [applicationId])

  const openDocumentModal = (document: any) => {
    setDocumentModal({
      isOpen: true,
      document
    })
  }

  const closeDocumentModal = () => {
    setDocumentModal({
      isOpen: false,
      document: null
    })
  }

  const fetchKPRDetail = async () => {
    try {
      setLoading(true)
      const result = await getKPRApplicationDetail(applicationId)
      setKprData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      setActionLoading('approve')
      await approveKPRApplication(applicationId, 'Application approved after review')
      toast.success('Application approved successfully')
      fetchKPRDetail() // Refresh data
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    try {
      setActionLoading('reject')
      await rejectKPRApplication(applicationId, 'Application rejected after review')
      toast.success('Application rejected successfully')
      fetchKPRDetail() // Refresh data
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject application')
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SUBMITTED: { variant: 'secondary' as const, label: 'Submitted' },
      APPROVED: { variant: 'default' as const, label: 'Approved' },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected' },
      PENDING: { variant: 'outline' as const, label: 'Pending' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading KPR application details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !kprData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error || 'KPR application not found'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">KPR Application Detail</h1>
            <p className="text-muted-foreground">{kprData.applicationNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge(kprData.status)}
          {kprData.status === 'SUBMITTED' && (
            <div className="flex space-x-2">
              <Button
                onClick={handleReject}
                variant="destructive"
                disabled={actionLoading !== null}
                className="flex items-center"
              >
                {actionLoading === 'reject' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={actionLoading !== null}
                className="flex items-center"
              >
                {actionLoading === 'approve' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Loan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Value</p>
                  <p className="font-semibold">{formatCurrency(kprData.propertyValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Amount</p>
                  <p className="font-semibold">{formatCurrency(kprData.loanAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Down Payment</p>
                  <p className="font-semibold">{formatCurrency(kprData.downPayment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Installment</p>
                  <p className="font-semibold">{formatCurrency(kprData.monthlyInstallment)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loan Term</p>
                  <p className="font-semibold">{kprData.loanTermYears} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold">{(kprData.interestRate * 100).toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{kprData.userInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIK</p>
                  <p className="font-semibold">{kprData.userInfo.nik}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{kprData.userInfo.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{kprData.userInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Occupation</p>
                  <p className="font-semibold">{kprData.userInfo.occupation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="font-semibold">{formatCurrency(kprData.userInfo.monthlyIncome)}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-semibold">
                  {kprData.userInfo.address}, {kprData.userInfo.city}, {kprData.userInfo.province} {kprData.userInfo.postalCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Property Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Property Title</p>
                <p className="font-semibold">{kprData.propertyInfo.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{kprData.propertyInfo.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Land Area</p>
                  <p className="font-semibold">{kprData.propertyInfo.landArea} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Building Area</p>
                  <p className="font-semibold">{kprData.propertyInfo.buildingArea} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold">{kprData.propertyInfo.bedrooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold">{kprData.propertyInfo.bathrooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Application Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="font-semibold">{formatDate(kprData.submittedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                {getStatusBadge(kprData.status)}
              </div>
            </CardContent>
          </Card>

          {/* Developer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Developer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold">{kprData.developerInfo.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-semibold">{kprData.developerInfo.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{kprData.developerInfo.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partnership Level</p>
                <Badge variant="outline">{kprData.developerInfo.partnershipLevel}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents ({kprData.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kprData.documents.map((doc) => (
                  <div key={doc.documentId} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.documentType.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDocumentModal(doc)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Modal */}
      <Dialog open={documentModal.isOpen} onOpenChange={closeDocumentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {documentModal.document?.documentType.replace('_', ' ')} - Document View
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {documentModal.document && (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Document Type</p>
                    <p className="font-medium">{documentModal.document.documentType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-medium">{(documentModal.document.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uploaded At</p>
                    <p className="font-medium">
                      {new Date(documentModal.document.uploadedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-3xl">
                    <img
                      src={documentModal.document.filePath}
                      alt={documentModal.document.documentType}
                      className="w-full h-auto rounded-lg border shadow-lg"
                      style={{ maxHeight: '70vh', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(documentModal.document.filePath, '_blank')}
                    >
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = documentModal.document.filePath
                        link.download = documentModal.document.documentName
                        link.click()
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
