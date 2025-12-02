import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Users,
  Pencil,
  Trash2,
  Mail,
  Calendar,
  Shield,
  Eye,
  Check,
  X,
  Heart,
  User,
  Baby,
  UserPlus,
  Search,
  Filter
} from 'lucide-react'

interface Recipient {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  relationshipType: RelationshipType
  accessControl: AccessControl
  messageVisibility: MessageVisibility
  profilePhotoUrl?: string
  phoneNumber?: string
  address?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

type RelationshipType =
  | 'child'
  | 'grandchild'
  | 'great_grandchild'
  | 'spouse'
  | 'sibling'
  | 'parent'
  | 'friend'
  | 'other'

interface AccessControl {
  canViewProfile: boolean
  canViewMessages: boolean
  canViewTimeCapsules: boolean
  canDownloadContent: boolean
  canShareContent: boolean
}

interface MessageVisibility {
  allMessages: boolean
  specificCategories: string[]
  specificMessages: string[]
}

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string; icon: any; color: string }[] = [
  { value: 'child', label: 'Child', icon: User, color: 'blue' },
  { value: 'grandchild', label: 'Grandchild', icon: Baby, color: 'purple' },
  { value: 'great_grandchild', label: 'Great-Grandchild', icon: Baby, color: 'pink' },
  { value: 'spouse', label: 'Spouse / Partner', icon: Heart, color: 'rose' },
  { value: 'sibling', label: 'Sibling', icon: Users, color: 'green' },
  { value: 'parent', label: 'Parent', icon: Shield, color: 'orange' },
  { value: 'friend', label: 'Friend', icon: UserPlus, color: 'cyan' },
  { value: 'other', label: 'Other', icon: Users, color: 'gray' }
]

const MESSAGE_CATEGORIES = [
  { id: 'life_story', label: 'Life Stories' },
  { id: 'advice', label: 'Advice & Wisdom' },
  { id: 'time_capsule', label: 'Time Capsules' },
  { id: 'specific_person', label: 'Personal Messages' },
  { id: 'everyday', label: 'Everyday Moments' }
]

export default function LivingLegacyRecipientManagementPage() {
  const navigate = useNavigate()

  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Johnson',
      email: 'emma.johnson@email.com',
      dateOfBirth: '2005-03-15',
      relationshipType: 'child',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: true,
        specificCategories: [],
        specificMessages: []
      },
      phoneNumber: '+1 (555) 123-4567',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      firstName: 'Oliver',
      lastName: 'Johnson',
      email: 'oliver.j@email.com',
      dateOfBirth: '2008-07-22',
      relationshipType: 'child',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: false,
        specificCategories: ['advice', 'life_story'],
        specificMessages: []
      },
      phoneNumber: '+1 (555) 123-4568',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRelationship, setFilterRelationship] = useState<RelationshipType | 'all'>('all')

  // Form state
  const [formData, setFormData] = useState<Partial<Recipient>>({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    relationshipType: 'child',
    phoneNumber: '',
    address: '',
    notes: '',
    accessControl: {
      canViewProfile: true,
      canViewMessages: true,
      canViewTimeCapsules: true,
      canDownloadContent: true,
      canShareContent: false
    },
    messageVisibility: {
      allMessages: true,
      specificCategories: [],
      specificMessages: []
    }
  })

  const handleAddRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      email: formData.email!,
      dateOfBirth: formData.dateOfBirth!,
      relationshipType: formData.relationshipType!,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      notes: formData.notes,
      accessControl: formData.accessControl!,
      messageVisibility: formData.messageVisibility!,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setRecipients([...recipients, newRecipient])
    resetForm()
    setShowAddModal(false)
  }

  const handleEditRecipient = () => {
    if (!editingRecipient) return

    setRecipients(recipients.map(r =>
      r.id === editingRecipient.id
        ? { ...formData as Recipient, id: r.id, createdAt: r.createdAt, updatedAt: new Date() }
        : r
    ))

    resetForm()
    setEditingRecipient(null)
  }

  const handleDeleteRecipient = (id: string) => {
    setRecipients(recipients.filter(r => r.id !== id))
    setShowDeleteConfirm(null)
  }

  const startEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient)
    setFormData(recipient)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      relationshipType: 'child',
      phoneNumber: '',
      address: '',
      notes: '',
      accessControl: {
        canViewProfile: true,
        canViewMessages: true,
        canViewTimeCapsules: true,
        canDownloadContent: true,
        canShareContent: false
      },
      messageVisibility: {
        allMessages: true,
        specificCategories: [],
        specificMessages: []
      }
    })
  }

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch =
      recipient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterRelationship === 'all' || recipient.relationshipType === filterRelationship

    return matchesSearch && matchesFilter
  })

  const getRelationshipInfo = (type: RelationshipType) => {
    return RELATIONSHIP_TYPES.find(r => r.value === type) || RELATIONSHIP_TYPES[0]
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recipient Management</h1>
                <p className="text-sm text-gray-600">Manage who can access your Living Legacy</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Recipient</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterRelationship}
                onChange={(e) => setFilterRelationship(e.target.value as RelationshipType | 'all')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Relationships</option>
                {RELATIONSHIP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Recipients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecipients.map(recipient => {
            const relationshipInfo = getRelationshipInfo(recipient.relationshipType)
            const RelationIcon = relationshipInfo.icon
            const age = calculateAge(recipient.dateOfBirth)

            return (
              <div key={recipient.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className={`bg-gradient-to-r from-${relationshipInfo.color}-500 to-${relationshipInfo.color}-600 p-4`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <RelationIcon className={`w-6 h-6 text-${relationshipInfo.color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {recipient.firstName} {recipient.lastName}
                        </h3>
                        <p className="text-sm text-white/80">{relationshipInfo.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(recipient)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(recipient.id)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{recipient.email}</span>
                    </div>
                    {recipient.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{recipient.phoneNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{age} years old (Born {new Date(recipient.dateOfBirth).toLocaleDateString()})</span>
                    </div>
                  </div>

                  {/* Access Control */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Access Permissions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(recipient.accessControl).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          {value ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-300" />
                          )}
                          <span className={value ? 'text-gray-700' : 'text-gray-400'}>
                            {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Visibility */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Message Visibility
                    </h4>
                    {recipient.messageVisibility.allMessages ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Can view all messages</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 mb-1">Limited to specific categories:</p>
                        <div className="flex flex-wrap gap-2">
                          {recipient.messageVisibility.specificCategories.map(cat => {
                            const category = MESSAGE_CATEGORIES.find(c => c.id === cat)
                            return category ? (
                              <span key={cat} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                                {category.label}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {recipient.notes && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{recipient.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredRecipients.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipients found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterRelationship !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first recipient to get started'}
            </p>
            {!searchQuery && filterRelationship === 'all' && (
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all"
              >
                Add First Recipient
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingRecipient) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingRecipient(null)
                  resetForm()
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship *
                    </label>
                    <select
                      value={formData.relationshipType}
                      onChange={(e) => setFormData({ ...formData, relationshipType: e.target.value as RelationshipType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {RELATIONSHIP_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Any additional notes about this recipient..."
                  />
                </div>
              </div>

              {/* Access Control */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Access Permissions
                </h3>
                <div className="space-y-3">
                  {Object.entries(formData.accessControl || {}).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          accessControl: {
                            ...formData.accessControl!,
                            [key]: e.target.checked
                          }
                        })}
                        className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message Visibility */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Message Visibility
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.messageVisibility?.allMessages}
                      onChange={(e) => setFormData({
                        ...formData,
                        messageVisibility: {
                          ...formData.messageVisibility!,
                          allMessages: e.target.checked,
                          specificCategories: e.target.checked ? [] : formData.messageVisibility!.specificCategories
                        }
                      })}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Allow access to all messages</span>
                      <p className="text-sm text-gray-600">Recipient can view all current and future messages</p>
                    </div>
                  </label>

                  {!formData.messageVisibility?.allMessages && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Or select specific categories:</p>
                      <div className="space-y-2">
                        {MESSAGE_CATEGORIES.map(category => (
                          <label key={category.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.messageVisibility?.specificCategories.includes(category.id)}
                              onChange={(e) => {
                                const current = formData.messageVisibility!.specificCategories
                                setFormData({
                                  ...formData,
                                  messageVisibility: {
                                    ...formData.messageVisibility!,
                                    specificCategories: e.target.checked
                                      ? [...current, category.id]
                                      : current.filter(c => c !== category.id)
                                  }
                                })
                              }}
                              className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{category.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingRecipient(null)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingRecipient ? handleEditRecipient : handleAddRecipient}
                  disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-lg hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRecipient ? 'Save Changes' : 'Add Recipient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Recipient?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this recipient? This action cannot be undone. They will lose access to all messages and time capsules.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRecipient(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
